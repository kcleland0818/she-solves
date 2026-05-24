import { test } from "../playwright-fixture";
import { runAxe, gotoAndReady } from "./a11y-helpers";

async function auditShop(page: any, shopName: string, slug: string) {
  // From town map: open shop dialog
  await gotoAndReady(page, "/", "#shop-markers, [aria-label*='shop' i]");
  await page.evaluate(() => {
    try { localStorage.clear(); } catch {}
  });
  await gotoAndReady(page, "/", "#shop-markers, [aria-label*='shop' i]");

  await page.locator(`button[aria-label*="${shopName}" i]`).first().click();
  await page.getByRole("dialog").first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
  await runAxe(page, `${slug}-1-shop-dialog`);

  // Enter shop -> welcome
  await page.getByRole("button", { name: /enter|start|let.s|begin/i }).first().click();
  await page.waitForTimeout(300);
  await runAxe(page, `${slug}-2-welcome`);

  // Scene 1
  await page.getByRole("button", { name: /let.s go|start|begin/i }).first().click();
  await page.waitForTimeout(300);
  await runAxe(page, `${slug}-3-scene1`);

  // Try challenge if present
  const challenge1 = page.getByRole("button", { name: /try.*challenge|challenge/i }).first();
  if (await challenge1.count() && await challenge1.isVisible().catch(() => false)) {
    await challenge1.click().catch(() => {});
    await page.waitForTimeout(250);
    await runAxe(page, `${slug}-3b-scene1-challenge`);
  }

  // Try to advance to scene 2 (best-effort)
  for (let i = 0; i < 6; i++) {
    const next = page.getByRole("button", { name: /next scene|next →|continue/i }).first();
    if (await next.count() && await next.isVisible().catch(() => false)) {
      await next.click().catch(() => {});
      await page.waitForTimeout(300);
      break;
    }
    const check = page.getByRole("button", { name: /^check$/i }).first();
    if (await check.count() && await check.isVisible().catch(() => false)) {
      await check.click().catch(() => {});
      await page.waitForTimeout(200);
    } else {
      break;
    }
  }
  await runAxe(page, `${slug}-4-scene2`);

  // Advance to scene 3
  for (let i = 0; i < 8; i++) {
    const next = page.getByRole("button", { name: /next scene|next →/i }).first();
    if (await next.count() && await next.isVisible().catch(() => false)) {
      await next.click().catch(() => {});
      await page.waitForTimeout(300);
      break;
    }
    const check = page.getByRole("button", { name: /^check$/i }).first();
    if (await check.count() && await check.isVisible().catch(() => false)) {
      await check.click().catch(() => {});
      await page.waitForTimeout(200);
    } else {
      const input = page.locator('input[type="number"], input[type="text"]').first();
      if (await input.count() && await input.isVisible().catch(() => false)) {
        await input.fill("10").catch(() => {});
      } else {
        break;
      }
    }
  }
  await runAxe(page, `${slug}-5-scene3`);
}

test("a11y audit: smoothie shop", async ({ page }) => {
  test.setTimeout(180_000);
  await auditShop(page, "Berry Bliss", "smoothie");
});

test("a11y audit: bakery", async ({ page }) => {
  test.setTimeout(180_000);
  await auditShop(page, "Sweet Crumbs", "bakery");
});

test("a11y audit: bookstore", async ({ page }) => {
  test.setTimeout(180_000);
  await auditShop(page, "Page Turner", "bookstore");
});
