import { test } from "../playwright-fixture";
import { runAxe, gotoAndReady } from "./a11y-helpers";

test("a11y audit across every scene", async ({ page }) => {
  test.setTimeout(240_000);


  // ---- 1. Town Map ----
  await gotoAndReady(page, "/", "#shop-markers, [aria-label*='shop' i]");
  await runAxe(page, "1-town-map");

  // ---- 2. Smoothie shop dialog ----
  await page.locator('button:has-text("Berry Bliss"), button[aria-label*="Berry Bliss" i], button:has-text("🍓")').first().click();
  await page.getByRole("dialog").first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
  await runAxe(page, "2-shop-dialog");

  // Enter the shop -> Welcome screen
  await page.getByRole("button", { name: /enter|start|let.s|begin/i }).first().click();
  await page.waitForTimeout(300);
  await runAxe(page, "3-welcome");

  // ---- 4. Scene 1: Ratios ----
  await page.getByRole("button", { name: /let.s go|start|begin/i }).first().click();
  await page.waitForTimeout(300);
  await runAxe(page, "4-scene1-ratios-explore");

  const tryChallenge1 = page.getByRole("button", { name: /try.*challenge|challenge/i }).first();
  if (await tryChallenge1.count()) {
    await tryChallenge1.click().catch(() => {});
    await page.waitForTimeout(250);
    await runAxe(page, "4b-scene1-challenge");
  }

  for (let i = 0; i < 4; i++) {
    const next = page.getByRole("button", { name: /next scene|next →|continue/i }).first();
    if (await next.count() && (await next.isVisible().catch(() => false))) {
      await next.click().catch(() => {});
      await page.waitForTimeout(300);
      break;
    }
    const check = page.getByRole("button", { name: /^check$/i }).first();
    if (await check.count() && (await check.isVisible().catch(() => false))) {
      await check.click().catch(() => {});
      await page.waitForTimeout(250);
    } else {
      break;
    }
  }

  // ---- 5. Scene 2: Percentages ----
  await page.waitForTimeout(250);
  await runAxe(page, "5-scene2-percentages-explore");

  const tryChallenge2 = page.getByRole("button", { name: /try.*challenge|challenge/i }).first();
  if (await tryChallenge2.count()) {
    await tryChallenge2.click().catch(() => {});
    await page.waitForTimeout(250);
    await runAxe(page, "5b-scene2-challenge");
  }

  for (let i = 0; i < 6; i++) {
    const next = page.getByRole("button", { name: /next scene|next →/i }).first();
    if (await next.count() && (await next.isVisible().catch(() => false))) {
      await next.click().catch(() => {});
      await page.waitForTimeout(300);
      break;
    }
    const input = page.locator('input[type="number"]').first();
    if (await input.count() && (await input.isVisible().catch(() => false))) {
      await input.fill(["27","40","17","17"][i % 4]);
      const check = page.getByRole("button", { name: /^check$/i }).first();
      if (await check.count()) await check.click().catch(() => {});
      await page.waitForTimeout(250);
    } else {
      break;
    }
  }

  // ---- 6. Scene 3: Discounts ----
  await page.waitForTimeout(250);
  await runAxe(page, "6-scene3-discounts-explore");

  const tryChallenge3 = page.getByRole("button", { name: /try.*challenge|challenge/i }).first();
  if (await tryChallenge3.count()) {
    await tryChallenge3.click().catch(() => {});
    await page.waitForTimeout(250);
    await runAxe(page, "6b-scene3-challenge");
  }

  // ---- 7. Calculator open ----
  const calcBtn = page.locator('button[aria-label*="calculator" i]').first();
  if (await calcBtn.count()) {
    await calcBtn.click();
    await page.waitForTimeout(250);
    await runAxe(page, "7-calculator-open");
  }

});

test("a11y audit: keyboard shortcuts hint", async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto("/");
  await page.evaluate(() => {
    try { localStorage.removeItem("berry-bliss:kbd-hint-dismissed"); } catch {}
  });
  await gotoAndReady(page, "/", "#shop-markers, [aria-label*='shop' i]");
  await page.locator('button:has-text("Berry Bliss"), button:has-text("🍓")').first().click().catch(() => {});
  await page.waitForTimeout(250);
  await page.getByRole("button", { name: /enter|start|let.s|begin/i }).first().click().catch(() => {});
  await page.waitForTimeout(250);
  await page.getByRole("button", { name: /let.s go|start/i }).first().click().catch(() => {});
  // Hint renders after a 600ms delay; wait just over that.
  await page.waitForTimeout(900);
  await runAxe(page, "8-with-keyboard-hint");
});

