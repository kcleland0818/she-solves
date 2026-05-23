import { test } from "./fixture";
import * as fs from "fs";
import * as path from "path";

const axeSource = fs.readFileSync(
  path.resolve("node_modules/axe-core/axe.min.js"),
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

async function auditShop(page: any, shopName: string, slug: string) {
  // From town map: open shop dialog
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => {
    try { localStorage.clear(); } catch {}
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.locator(`button[aria-label*="${shopName}" i]`).first().click();
  await page.waitForTimeout(300);
  await runAxe(page, `${slug}-1-shop-dialog`);

  // Enter shop -> welcome
  await page.getByRole("button", { name: /enter|start|let.s|begin/i }).first().click();
  await page.waitForTimeout(400);
  await runAxe(page, `${slug}-2-welcome`);

  // Scene 1
  await page.getByRole("button", { name: /let.s go|start|begin/i }).first().click();
  await page.waitForTimeout(400);
  await runAxe(page, `${slug}-3-scene1`);

  // Try challenge if present
  const challenge1 = page.getByRole("button", { name: /try.*challenge|challenge/i }).first();
  if (await challenge1.count() && await challenge1.isVisible().catch(() => false)) {
    await challenge1.click().catch(() => {});
    await page.waitForTimeout(300);
    await runAxe(page, `${slug}-3b-scene1-challenge`);
  }

  // Try to advance to scene 2 (best-effort)
  for (let i = 0; i < 6; i++) {
    const next = page.getByRole("button", { name: /next scene|next →|continue/i }).first();
    if (await next.count() && await next.isVisible().catch(() => false)) {
      await next.click().catch(() => {});
      await page.waitForTimeout(400);
      break;
    }
    const check = page.getByRole("button", { name: /^check$/i }).first();
    if (await check.count() && await check.isVisible().catch(() => false)) {
      await check.click().catch(() => {});
      await page.waitForTimeout(250);
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
      await page.waitForTimeout(400);
      break;
    }
    const check = page.getByRole("button", { name: /^check$/i }).first();
    if (await check.count() && await check.isVisible().catch(() => false)) {
      await check.click().catch(() => {});
      await page.waitForTimeout(250);
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
