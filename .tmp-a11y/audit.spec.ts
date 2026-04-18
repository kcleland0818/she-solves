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
      helpUrl: v.helpUrl,
      nodeCount: v.nodes.length,
      sample: v.nodes[0]?.html?.slice(0, 220),
      target: v.nodes[0]?.target,
    })),
  };
  console.log("AXE_RESULT::" + JSON.stringify(summary));
}

test("a11y audit across every scene", async ({ page }) => {
  test.setTimeout(180_000);

  // ---- 1. Town Map ----
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await runAxe(page, "1-town-map");

  // ---- 2. Smoothie shop dialog (still on town map) ----
  await page.locator('button[aria-label*="Berry Bliss" i]').first().click();
  await page.waitForTimeout(400);
  await runAxe(page, "2-shop-dialog");

  // Enter the shop -> Welcome screen
  await page.getByRole("button", { name: /enter|start|let.s|begin/i }).first().click();
  await page.waitForTimeout(400);
  await runAxe(page, "3-welcome");

  // ---- 4. Scene 1: Ratios ----
  await page.getByRole("button", { name: /let.s go|start|begin/i }).first().click();
  await page.waitForTimeout(400);
  await runAxe(page, "4-scene1-ratios-explore");

  // Try the challenge phase
  const tryChallenge1 = page.getByRole("button", { name: /try.*challenge|challenge/i }).first();
  if (await tryChallenge1.count()) {
    await tryChallenge1.click().catch(() => {});
    await page.waitForTimeout(300);
    await runAxe(page, "4b-scene1-challenge");
  }

  // Force-advance: keep clicking any "Next Scene" / "Skip" button if present.
  // Otherwise click "Check" with current ratio (it pre-fills with a valid ratio).
  for (let i = 0; i < 4; i++) {
    const next = page.getByRole("button", { name: /next scene|next →|continue/i }).first();
    if (await next.count() && (await next.isVisible().catch(() => false))) {
      await next.click().catch(() => {});
      await page.waitForTimeout(400);
      break;
    }
    const check = page.getByRole("button", { name: /^check$/i }).first();
    if (await check.count() && (await check.isVisible().catch(() => false))) {
      await check.click().catch(() => {});
      await page.waitForTimeout(300);
    } else {
      break;
    }
  }

  // ---- 5. Scene 2: Percentages ----
  await page.waitForTimeout(300);
  await runAxe(page, "5-scene2-percentages-explore");

  const tryChallenge2 = page.getByRole("button", { name: /try.*challenge|challenge/i }).first();
  if (await tryChallenge2.count()) {
    await tryChallenge2.click().catch(() => {});
    await page.waitForTimeout(300);
    await runAxe(page, "5b-scene2-challenge");
  }

  // Advance past scene 2: type the right answer? Easier — click any "Next Scene" if present,
  // otherwise type something and check, repeatedly until a "Next Scene" appears.
  for (let i = 0; i < 6; i++) {
    const next = page.getByRole("button", { name: /next scene|next →/i }).first();
    if (await next.count() && (await next.isVisible().catch(() => false))) {
      await next.click().catch(() => {});
      await page.waitForTimeout(400);
      break;
    }
    const input = page.locator('input[type="number"]').first();
    if (await input.count() && (await input.isVisible().catch(() => false))) {
      // 40% is a reasonable guess for one of the slices; if wrong we just retry
      await input.fill(["27","40","17","17"][i % 4]);
      const check = page.getByRole("button", { name: /^check$/i }).first();
      if (await check.count()) await check.click().catch(() => {});
      await page.waitForTimeout(300);
    } else {
      break;
    }
  }

  // ---- 6. Scene 3: Discounts ----
  await page.waitForTimeout(300);
  await runAxe(page, "6-scene3-discounts-explore");

  const tryChallenge3 = page.getByRole("button", { name: /try.*challenge|challenge/i }).first();
  if (await tryChallenge3.count()) {
    await tryChallenge3.click().catch(() => {});
    await page.waitForTimeout(300);
    await runAxe(page, "6b-scene3-challenge");
  }

  // ---- 7. Calculator open ----
  const calcBtn = page.locator('button[aria-label*="calculator" i]').first();
  if (await calcBtn.count()) {
    await calcBtn.click();
    await page.waitForTimeout(300);
    await runAxe(page, "7-calculator-open");
  }

  // ---- 8. Keyboard shortcuts hint (clear localStorage and reload to force it) ----
  await page.evaluate(() => {
    try { localStorage.removeItem("berry-bliss:kbd-hint-dismissed"); } catch {}
  });
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  // Need to be on a scene for the hint to render — navigate back into scene 1 quickly
  await page.locator('button:has-text("Berry Bliss"), button:has-text("🍓")').first().click().catch(() => {});
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /enter|start|let.s|begin/i }).first().click().catch(() => {});
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: /let.s go|start/i }).first().click().catch(() => {});
  await page.waitForTimeout(1200); // hint appears after 600ms
  await runAxe(page, "8-with-keyboard-hint");
});
