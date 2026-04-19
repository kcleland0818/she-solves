import { test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const axeSource = fs.readFileSync(
  path.resolve("/tmp/a11y-deps/node_modules/axe-core/axe.min.js"),
  "utf8"
);

// Returns the frame containing the actual app, or main page if no iframe wrapper.
async function appFrame(page: any) {
  // Wait briefly for any iframes to attach
  await page.waitForTimeout(300);
  const iframes = page.frames().filter((f: any) => f !== page.mainFrame());
  // Prefer an iframe that contains our app's marker (e.g., the root div with React content)
  for (const f of iframes) {
    try {
      const hasRoot = await f.locator("#root, #main-content, [id='shop-markers']").count();
      if (hasRoot > 0) return f;
    } catch {}
  }
  return page.mainFrame();
}

async function runAxe(page: any, label: string) {
  const frame = await appFrame(page);
  await frame.evaluate(axeSource);
  const result = await frame.evaluate(async () => {
    // @ts-ignore
    return await window.axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"],
      },
      resultTypes: ["violations"],
    });
  });
  const summary = {
    scene: label,
    violations: result.violations.map((v: any) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodeCount: v.nodes.length,
      sample: v.nodes[0]?.html?.slice(0, 200),
      target: v.nodes[0]?.target,
    })),
  };
  console.log("AXE_RESULT::" + JSON.stringify(summary));
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

test("a11y audit across every scene", async ({ page }) => {
  test.setTimeout(180_000);

  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1500);

  // 1. Town Map
  await runAxe(page, "1-town-map");

  // 2. Shop dialog
  const frame = await appFrame(page);
  await frame.locator('button[aria-label*="Berry Bliss" i]').first().click();
  await page.waitForTimeout(600);
  await runAxe(page, "2-shop-dialog");

  // 3. Welcome
  await clickByName(page, /^enter shop/i);
  await page.waitForTimeout(500);
  await runAxe(page, "3-welcome");

  // 4. Scene 1 explore
  await clickByName(page, /let.?s go/i);
  await page.waitForTimeout(500);
  await runAxe(page, "4-scene1-ratios-explore");

  // 4b. Scene 1 challenge
  await clickByName(page, /try the challenge/i);
  await page.waitForTimeout(400);
  await runAxe(page, "4b-scene1-challenge");

  for (let i = 0; i < 5; i++) {
    if (await tryClickByName(page, /^next scene/i)) {
      await page.waitForTimeout(400);
      break;
    }
    await tryClickByName(page, /^check$/i);
    await page.waitForTimeout(300);
  }

  // 5. Scene 2 explore
  await page.waitForTimeout(400);
  await runAxe(page, "5-scene2-percentages-explore");

  await tryClickByName(page, /try the challenge/i);
  await page.waitForTimeout(400);
  await runAxe(page, "5b-scene2-challenge");

  const guesses = ["40", "27", "17", "16"];
  for (let i = 0; i < 8; i++) {
    if (await tryClickByName(page, /^next scene/i)) {
      await page.waitForTimeout(400);
      break;
    }
    const f = await appFrame(page);
    const input = f.locator('input[type="number"]').first();
    if ((await input.count()) && (await input.isVisible().catch(() => false))) {
      await input.fill(guesses[i % guesses.length]);
      await tryClickByName(page, /^check$/i);
      await page.waitForTimeout(300);
    }
  }

  // 6. Scene 3
  await page.waitForTimeout(400);
  await runAxe(page, "6-scene3-discounts-explore");

  await tryClickByName(page, /try the challenge/i);
  await page.waitForTimeout(400);
  await runAxe(page, "6b-scene3-challenge");

  // 7. Calculator
  const f = await appFrame(page);
  const calcBtn = f.locator('button[aria-label*="calculator" i]').first();
  if ((await calcBtn.count()) && (await calcBtn.isVisible().catch(() => false))) {
    await calcBtn.click();
    await page.waitForTimeout(400);
    await runAxe(page, "7-calculator-open");
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(200);
  }

  // 8. Keyboard hint
  const f2 = await appFrame(page);
  await f2.evaluate(() => {
    try { localStorage.removeItem("berry-bliss:kbd-hint-dismissed"); } catch {}
  });
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1500);
  const f3 = await appFrame(page);
  await f3.locator('button[aria-label*="Berry Bliss" i]').first().click().catch(() => {});
  await page.waitForTimeout(500);
  await tryClickByName(page, /^enter shop/i);
  await page.waitForTimeout(500);
  await tryClickByName(page, /let.?s go/i);
  await page.waitForTimeout(1500);
  await runAxe(page, "8-keyboard-hint-visible");
});
