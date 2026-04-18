import { test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const axeSource = fs.readFileSync(
  path.resolve("/dev-server/node_modules/axe-core/axe.min.js"),
  "utf8"
);

async function runAxe(page: any, label: string) {
  await page.evaluate(axeSource);
  const result = await page.evaluate(async () => {
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

async function clickByName(page: any, name: RegExp, timeout = 5000) {
  const btn = page.getByRole("button", { name }).first();
  await btn.waitFor({ state: "visible", timeout });
  await btn.click();
}

async function tryClickByName(page: any, name: RegExp): Promise<boolean> {
  const btn = page.getByRole("button", { name }).first();
  if ((await btn.count()) === 0) return false;
  if (!(await btn.isVisible().catch(() => false))) return false;
  await btn.click().catch(() => {});
  return true;
}

test("a11y audit across every scene", async ({ page }) => {
  test.setTimeout(180_000);

  // ---- 1. Town Map ----
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(800);
  await runAxe(page, "1-town-map");

  // ---- 2. Shop dialog ----
  await page.locator('button[aria-label*="Berry Bliss" i]').first().click();
  await page.waitForTimeout(500);
  await runAxe(page, "2-shop-dialog");

  // ---- 3. Welcome ----
  await clickByName(page, /^enter shop/i);
  await page.waitForTimeout(500);
  await runAxe(page, "3-welcome");

  // ---- 4. Scene 1 explore ----
  await clickByName(page, /let.?s go/i);
  await page.waitForTimeout(500);
  await runAxe(page, "4-scene1-ratios-explore");

  // ---- 4b. Scene 1 challenge ----
  await clickByName(page, /try the challenge/i);
  await page.waitForTimeout(400);
  await runAxe(page, "4b-scene1-challenge");

  // Click Check until "Next Scene" appears (challenge pre-fills correct ratio)
  for (let i = 0; i < 5; i++) {
    if (await tryClickByName(page, /^next scene/i)) {
      await page.waitForTimeout(400);
      break;
    }
    await tryClickByName(page, /^check$/i);
    await page.waitForTimeout(300);
  }

  // ---- 5. Scene 2 explore ----
  await page.waitForTimeout(400);
  await runAxe(page, "5-scene2-percentages-explore");

  // ---- 5b. Scene 2 challenge ----
  await tryClickByName(page, /try the challenge/i);
  await page.waitForTimeout(400);
  await runAxe(page, "5b-scene2-challenge");

  // Try a bunch of % guesses until Next Scene appears
  const guesses = ["40", "27", "17", "16"];
  for (let i = 0; i < 8; i++) {
    if (await tryClickByName(page, /^next scene/i)) {
      await page.waitForTimeout(400);
      break;
    }
    const input = page.locator('input[type="number"]').first();
    if ((await input.count()) && (await input.isVisible().catch(() => false))) {
      await input.fill(guesses[i % guesses.length]);
      await tryClickByName(page, /^check$/i);
      await page.waitForTimeout(300);
    }
  }

  // ---- 6. Scene 3 explore ----
  await page.waitForTimeout(400);
  await runAxe(page, "6-scene3-discounts-explore");

  // ---- 6b. Scene 3 challenge ----
  await tryClickByName(page, /try the challenge/i);
  await page.waitForTimeout(400);
  await runAxe(page, "6b-scene3-challenge");

  // ---- 7. Calculator open (FAB is global, present during scenes) ----
  const calcBtn = page.locator('button[aria-label*="calculator" i]').first();
  if ((await calcBtn.count()) && (await calcBtn.isVisible().catch(() => false))) {
    await calcBtn.click();
    await page.waitForTimeout(400);
    await runAxe(page, "7-calculator-open");
    // close
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(200);
  }

  // ---- 8. Keyboard shortcuts hint (force re-show) ----
  await page.evaluate(() => {
    try { localStorage.removeItem("berry-bliss:kbd-hint-dismissed"); } catch {}
  });
  // Reload and re-navigate quickly into scene 1 so the hint can render
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(500);
  await page.locator('button[aria-label*="Berry Bliss" i]').first().click().catch(() => {});
  await page.waitForTimeout(400);
  await tryClickByName(page, /^enter shop/i);
  await page.waitForTimeout(400);
  await tryClickByName(page, /let.?s go/i);
  await page.waitForTimeout(1500);
  await runAxe(page, "8-keyboard-hint-visible");
});
