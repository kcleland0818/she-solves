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
      const style = window.getComputedStyle(el as HTMLElement);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
      return true;
    };

    // Scope: <section> with bakery heading id, or main content if scene container not found.
    const scenes = document.querySelectorAll(
      'section[aria-labelledby^="bakery-"], #main-content'
    );
    const root: Element = scenes[0] || document.body;

    const selector =
      'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [role="link"], [tabindex]';
    const all = Array.from(root.querySelectorAll(selector)).filter((el) => {
      // Skip elements inside aria-hidden subtrees
      let p: Element | null = el;
      while (p) {
        if (p.getAttribute && p.getAttribute("aria-hidden") === "true") return false;
        p = p.parentElement;
      }
      return isVisible(el);
    });

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
      }
    }

    return {
      scene: sceneLabel,
      totalControls: all.length,
      missingName,
      notFocusable,
    };
  }, scene);
  return result;
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
  await page.waitForTimeout(500);
}

test("every Sweet Crumbs control has an accessible name and is keyboard reachable", async ({ page }) => {
  test.setTimeout(180_000);

  await enterBakery(page);

  const reports: ControlReport[] = [];

  // Scene 1 explore
  reports.push(await auditControls(page, "bakery-scene1-explore"));

  // Scene 1 challenge
  await tryClickByName(page, /try a customer order|try the challenge/i);
  await page.waitForTimeout(400);
  reports.push(await auditControls(page, "bakery-scene1-challenge"));

  // Force advance to scene 2
  for (let i = 0; i < 6; i++) {
    if (await tryClickByName(page, /^next scene/i)) {
      await page.waitForTimeout(400);
      break;
    }
    await tryClickByName(page, /check my slices/i);
    await page.waitForTimeout(300);
  }

  // Scene 2 explore
  reports.push(await auditControls(page, "bakery-scene2-explore"));

  await tryClickByName(page, /try a customer order|try the challenge/i);
  await page.waitForTimeout(400);
  reports.push(await auditControls(page, "bakery-scene2-challenge"));

  // Force advance to scene 3
  for (let i = 0; i < 8; i++) {
    if (await tryClickByName(page, /^next scene/i)) {
      await page.waitForTimeout(400);
      break;
    }
    const fr = await appFrame(page);
    const cells = fr.locator('button[aria-label^="Cupcake"]');
    const count = await cells.count();
    for (let j = 0; j < count; j++) {
      await cells.nth(j).click().catch(() => {});
    }
    await tryClickByName(page, /check the tray/i);
    await page.waitForTimeout(300);
  }

  // Scene 3 explore
  reports.push(await auditControls(page, "bakery-scene3-explore"));

  await tryClickByName(page, /take real orders|try the challenge/i);
  await page.waitForTimeout(400);
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
