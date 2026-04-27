import { test, expect } from "@playwright/test";

// Returns the frame containing the actual app, or main page if no iframe wrapper.
async function appFrame(page: any) {
  await page.waitForTimeout(300);
  const iframes = page.frames().filter((f: any) => f !== page.mainFrame());
  for (const f of iframes) {
    try {
      const hasRoot = await f.locator("#root, #main-content, [id='shop-markers']").count();
      if (hasRoot > 0) return f;
    } catch {}
  }
  return page.mainFrame();
}

async function clickByName(page: any, name: RegExp, timeout = 8000) {
  const frame = await appFrame(page);
  const btn = frame.getByRole("button", { name }).first();
  await btn.waitFor({ state: "visible", timeout });
  await btn.click();
}

async function tryClickByName(page: any, name: RegExp): Promise<boolean> {
  const frame = await appFrame(page);
  const btn = frame.getByRole("button", { name }).first();
  if ((await btn.count()) === 0) return false;
  if (!(await btn.isVisible().catch(() => false))) return false;
  await btn.click().catch(() => {});
  return true;
}

interface ControlReport {
  scene: string;
  totalControls: number;
  missingName: Array<{ tag: string; html: string; outerSnippet: string }>;
  notFocusable: Array<{ tag: string; html: string; outerSnippet: string; reason: string }>;
}

// Audit every interactive control inside the bakery scene container:
//   - has a non-empty accessible name (aria-label, aria-labelledby, or text)
//   - is keyboard focusable (tabindex !== -1, not disabled, visible)
async function auditControls(page: any, scene: string): Promise<ControlReport> {
  const frame = await appFrame(page);
  const result = await frame.evaluate((sceneLabel: string) => {
    // Compute an accessible name without axe — covers the common cases.
    const accessibleName = (el: Element): string => {
      const aria = el.getAttribute("aria-label");
      if (aria && aria.trim()) return aria.trim();
      const labelledby = el.getAttribute("aria-labelledby");
      if (labelledby) {
        const ids = labelledby.split(/\s+/);
        const text = ids
          .map((id) => document.getElementById(id)?.textContent?.trim() || "")
          .filter(Boolean)
          .join(" ");
        if (text) return text;
      }
      const tag = el.tagName.toLowerCase();
      if (tag === "input") {
        const input = el as HTMLInputElement;
        // Associated <label for=...>
        if (input.id) {
          const lbl = document.querySelector(`label[for="${input.id}"]`);
          if (lbl?.textContent?.trim()) return lbl.textContent.trim();
        }
        // Wrapping <label>
        const wrapping = el.closest("label");
        if (wrapping?.textContent?.trim()) return wrapping.textContent.trim();
        // Placeholder is a fallback (not great, but counts as a name)
        if (input.placeholder?.trim()) return input.placeholder.trim();
        if (input.title?.trim()) return input.title.trim();
        if (input.type === "submit" || input.type === "button") {
          if (input.value?.trim()) return input.value.trim();
        }
      }
      if (tag === "select") {
        const sel = el as HTMLSelectElement;
        if (sel.id) {
          const lbl = document.querySelector(`label[for="${sel.id}"]`);
          if (lbl?.textContent?.trim()) return lbl.textContent.trim();
        }
        const wrapping = el.closest("label");
        if (wrapping?.textContent?.trim()) return wrapping.textContent.trim();
        if (sel.title?.trim()) return sel.title.trim();
      }
      // Visible text content (excluding aria-hidden subtrees).
      const clone = el.cloneNode(true) as Element;
      clone.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
      const text = clone.textContent?.replace(/\s+/g, " ").trim() || "";
      if (text) return text;
      // <img alt> inside the control
      const img = el.querySelector("img[alt]");
      const alt = img?.getAttribute("alt")?.trim();
      if (alt) return alt;
      const title = el.getAttribute("title");
      if (title?.trim()) return title.trim();
      return "";
    };

    const isVisible = (el: Element): boolean => {
      const rect = (el as HTMLElement).getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return false;
      // computedStyle may be partial for SVG sub-elements; check ancestor display/visibility too.
      let p: Element | null = el;
      while (p) {
        const style = window.getComputedStyle(p as HTMLElement);
        if (style.display === "none" || style.visibility === "hidden") return false;
        p = p.parentElement;
      }
      return true;
    };

    // Scope: ALL <section> elements with bakery- heading id (in case more than one is mounted).
    const sceneEls = Array.from(
      document.querySelectorAll('section[aria-labelledby^="bakery-"]')
    );
    const roots: Element[] = sceneEls.length > 0 ? sceneEls : [document.body];

    const selector =
      'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [role="link"], [tabindex]';
    const all = roots.flatMap((root) =>
      Array.from(root.querySelectorAll(selector)).filter((el) => {
        // Skip elements inside aria-hidden subtrees
        let p: Element | null = el;
        while (p) {
          if (p.getAttribute && p.getAttribute("aria-hidden") === "true") return false;
          p = p.parentElement;
        }
        return isVisible(el);
      })
    );

    // Diagnostic: per-tag/role count to make scene snapshots easy to verify by hand.
    const byTag: Record<string, number> = {};
    for (const el of all) {
      const k = el.tagName.toLowerCase() + (el.getAttribute("role") ? `[role=${el.getAttribute("role")}]` : "");
      byTag[k] = (byTag[k] || 0) + 1;
    }

    const missingName: Array<{ tag: string; html: string; outerSnippet: string }> = [];
    const notFocusable: Array<{
      tag: string; html: string; outerSnippet: string; reason: string;
    }> = [];

    for (const el of all) {
      const tag = el.tagName.toLowerCase();
      const html = (el as HTMLElement).outerHTML.slice(0, 220);
      const inner = el.textContent?.replace(/\s+/g, " ").trim().slice(0, 60) || "";
      const outerSnippet = `<${tag}${el.getAttribute("aria-label") ? ` aria-label="${el.getAttribute("aria-label")}"` : ""}>${inner}</${tag}>`;

      const name = accessibleName(el);
      if (!name) {
        missingName.push({ tag, html, outerSnippet });
      }

      // Focusability: tabindex >= 0 (or natural), not disabled
      const tabindexAttr = el.getAttribute("tabindex");
      const tabindex = tabindexAttr !== null ? parseInt(tabindexAttr, 10) : null;
      const isDisabled =
        (el as HTMLButtonElement).disabled === true ||
        el.getAttribute("aria-disabled") === "true";

      const naturallyFocusable = ["a", "button", "input", "select", "textarea"].includes(tag);
      let focusable = false;
      let reason = "";
      if (tabindex !== null) {
        if (tabindex < 0) {
          reason = "tabindex < 0";
        } else {
          focusable = true;
        }
      } else if (naturallyFocusable) {
        if (tag === "a" && !el.hasAttribute("href")) {
          reason = "anchor without href";
        } else if (isDisabled) {
          // disabled buttons are intentionally not focusable; skip from "not focusable" complaint
          // because the test should only flag controls that *should* be reachable
          focusable = true; // treat as acceptable; they are explicitly removed from tab order
        } else {
          focusable = true;
        }
      } else {
        reason = "non-native role without tabindex";
      }

      if (!focusable) {
        notFocusable.push({ tag, html, outerSnippet, reason });
        continue;
      }

      // Programmatic focus check — confirms the browser actually places focus on it.
      // Disabled buttons are intentionally non-focusable; skip them.
      if (!isDisabled) {
        try {
          (el as HTMLElement).focus();
          if (document.activeElement !== el) {
            notFocusable.push({
              tag,
              html,
              outerSnippet,
              reason: "element.focus() did not move document.activeElement",
            });
          }
        } catch (err) {
          notFocusable.push({
            tag,
            html,
            outerSnippet,
            reason: "focus() threw: " + String(err),
          });
        }
      }
    }

    return {
      scene: sceneLabel,
      totalControls: all.length,
      missingName,
      notFocusable,
      byTag,
    };
  }, scene);
  return result;
}

async function waitForBakeryScene(page: any, sceneNumber: 1 | 2 | 3) {
  const f = await appFrame(page);
  // Heading id pattern: bakery-scene1-heading, etc.
  const heading = f.locator(`h2#bakery-scene${sceneNumber}-heading`);
  await heading.waitFor({ state: "visible", timeout: 8000 });
  // Settle a tick for hint/feedback rendering.
  await page.waitForTimeout(200);
}

async function waitForChallengePhase(page: any) {
  const f = await appFrame(page);
  // Challenge phase shows Hint button + Check button
  await f.getByRole("button", { name: /^hint$/i }).first().waitFor({ state: "visible", timeout: 8000 });
}

async function enterBakery(page: any) {
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1500);
  const f = await appFrame(page);
  await f.locator('button[aria-label*="Sweet Crumbs" i]').first().click();
  await page.waitForTimeout(500);
  await clickByName(page, /^enter shop|^revisit shop/i);
  await page.waitForTimeout(400);
  await clickByName(page, /start baking/i);
  await waitForBakeryScene(page, 1);
}

test("every Sweet Crumbs control has an accessible name and is keyboard reachable", async ({ page }) => {
  test.setTimeout(180_000);

  await enterBakery(page);

  const reports: ControlReport[] = [];

  // ----- Scene 1 -----
  reports.push(await auditControls(page, "bakery-scene1-explore"));

  await clickByName(page, /try a customer order/i);
  await waitForChallengePhase(page);
  reports.push(await auditControls(page, "bakery-scene1-challenge"));

  // Solve scene 1 challenge: read "Target: N/D" then shade N cake slices (role="button" SVG paths).
  {
    const fr = await appFrame(page);
    const targetText = await fr.locator('text=/Target:\\s*\\d+\\/\\d+/').first().innerText();
    const m = targetText.match(/(\d+)\s*\/\s*(\d+)/);
    const n = m ? parseInt(m[1], 10) : 1;
    const slices = fr.locator('[role="button"][aria-label^="Slice "]');
    for (let j = 0; j < n; j++) {
      await slices.nth(j).click().catch(() => {});
    }
    await clickByName(page, /check my slices/i);
    await fr.getByRole("button", { name: /^next scene/i }).first().waitFor({ state: "visible", timeout: 8000 });
    await clickByName(page, /^next scene/i);
  }
  await waitForBakeryScene(page, 2);

  // ----- Scene 2 -----
  reports.push(await auditControls(page, "bakery-scene2-explore"));

  await clickByName(page, /try a customer order/i);
  await waitForChallengePhase(page);
  reports.push(await auditControls(page, "bakery-scene2-challenge"));

  // Solve scene 2: read "Goal: frost X/Y" then frost X cupcakes.
  {
    const fr = await appFrame(page);
    const goalText = await fr.locator('text=/Goal:.*\\d+\\/\\d+/').first().innerText();
    // Goal label uses the equivalent fraction like "1/3"; we need to count by shading until check passes.
    // Easier: brute-force — frost all then peel off until check succeeds is slow; instead, parse the
    // "frosted: M/N" line which updates live. But target is the EQUIVALENT, e.g., "1/3 of tray of 6"
    // means 2 cupcakes. Compute from the equivalent and the total.
    const equivMatch = goalText.match(/(\d+)\s*\/\s*(\d+)/);
    const totalText = await fr.locator('text=/of\\s+\\d+\\s+cupcakes/i').first().innerText().catch(() => "");
    const totalMatch = totalText.match(/of\s+(\d+)\s+cupcakes/i);
    let toFrost = 0;
    if (equivMatch && totalMatch) {
      const en = parseInt(equivMatch[1], 10);
      const ed = parseInt(equivMatch[2], 10);
      const total = parseInt(totalMatch[1], 10);
      toFrost = Math.round((en / ed) * total);
    }
    const cells = fr.locator('button[aria-label^="Cupcake"]');
    for (let j = 0; j < toFrost; j++) {
      await cells.nth(j).click().catch(() => {});
    }
    await clickByName(page, /check the tray/i);
    await fr.getByRole("button", { name: /^next scene/i }).first().waitFor({ state: "visible", timeout: 8000 });
    await clickByName(page, /^next scene/i);
  }

  // ----- Scene 3 -----
  reports.push(await auditControls(page, "bakery-scene3-explore"));

  await clickByName(page, /take real orders/i);
  await waitForChallengePhase(page);
  reports.push(await auditControls(page, "bakery-scene3-challenge"));

  // Print machine-parseable report
  for (const r of reports) {
    console.log("CONTROL_AUDIT::" + JSON.stringify(r));
  }

  // Aggregate failures
  const failures: string[] = [];
  for (const r of reports) {
    if (r.missingName.length) {
      failures.push(
        `[${r.scene}] ${r.missingName.length} control(s) missing accessible name: ` +
          r.missingName.map((m) => m.outerSnippet).join(" | ")
      );
    }
    if (r.notFocusable.length) {
      failures.push(
        `[${r.scene}] ${r.notFocusable.length} control(s) not keyboard reachable: ` +
          r.notFocusable.map((m) => `${m.outerSnippet} (${m.reason})`).join(" | ")
      );
    }
  }

  expect(failures, failures.join("\n")).toEqual([]);
});
