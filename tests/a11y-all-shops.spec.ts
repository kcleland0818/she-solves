import { test } from "../playwright-fixture";
import { runAxe, gotoAndReady, logStage } from "./a11y-helpers";

// Next-button regex covers: "Next Scene", "Next book", "Next sentence",
// "Next round", "Next wheel", "Next machine", "On to sorting!", "Continue",
// "Finish ...".
const NEXT_RE = /next\b|continue|on to|finish/i;

// Answer groups students click, minus the floating calculator widget.
const ANSWER_GROUP =
  '[role="group"]:not([aria-label*="calculator" i]) button, button[aria-label^="Choose"]';

const isVisible = async (loc: any) =>
  (await loc.count()) > 0 && (await loc.first().isVisible().catch(() => false));

/**
 * Spin-the-wheel: read the wheel's own accessible description and the question,
 * then type the matching fraction. Keeps the audit honest — the lesson now
 * generates a fresh wheel on every visit, so answers can't be hard-coded.
 */
async function answerWheel(page: any) {
  const top = page.getByLabel("Top number");
  if (!(await isVisible(top))) return;
  const label = await page
    .locator('svg[role="img"][aria-label*="Prize wheel"]')
    .first()
    .getAttribute("aria-label")
    .catch(() => null);
  const question = await page.locator("form p").first().innerText().catch(() => "");
  const target = question.match(/landing on (\w+)/)?.[1];
  if (!label || !target) return;
  const total = Number(label.match(/with (\d+) equal sections/)?.[1]);
  const counts: Record<string, number> = {};
  for (const m of label.matchAll(/(\d+) (gold|red|blue|green)/g)) {
    counts[m[2]] = Number(m[1]);
  }
  if (!total || counts[target] === undefined) return;
  await top.fill(String(counts[target]));
  await page.getByLabel("Bottom number").fill(String(total));
}

/**
 * Claw-machine forecast: count the plushies from the machine's list, work out
 * the expected wins for the number of plays asked about, and type that in.
 */
async function answerForecast(page: any) {
  const input = page.locator("#forecast");
  if (!(await isVisible(input))) return;
  const items = await page
    .locator('ul[aria-label="Plushies in the machine"] li')
    .allInnerTexts()
    .catch(() => [] as string[]);
  const parsed = items
    .map((t) => t.match(/(\d+)\s+(\w+)/))
    .filter(Boolean)
    .map((m) => ({ count: Number(m![1]), name: m![2].toLowerCase() }));
  const total = parsed.reduce((s, i) => s + i.count, 0);
  if (!parsed.length || !total) return;
  const question = await page.locator("form label").first().innerText().catch(() => "");
  const plays = Number(question.match(/play (\d+) times/)?.[1]);
  const hit = parsed.find((i) => question.toLowerCase().includes(i.name));
  if (!plays || !hit) return;
  const expected = (plays * hit.count) / total;
  await input.fill(String(expected));
}

/**
 * Multiple-choice answers (likelihood scale, prize bags): try the options
 * until the app reveals a way forward, then report success.
 */
async function bruteForceGroup(page: any) {
  const group = page.locator(ANSWER_GROUP);
  const n = Math.min(await group.count().catch(() => 0), 6);
  for (let i = 0; i < n; i++) {
    const b = group.nth(i);
    if (!(await b.isVisible().catch(() => false))) continue;
    await b.click().catch(() => {});
    await page.waitForTimeout(200);
    if (await isVisible(page.getByRole("button", { name: NEXT_RE }).first())) return true;
  }
  return false;
}

/** Walk the lesson forward as far as possible; returns false when stuck. */
async function advance(page: any, tries: number) {
  for (let i = 0; i < tries; i++) {
    const next = page.getByRole("button", { name: NEXT_RE }).first();
    if (await isVisible(next)) {
      await next.click().catch(() => {});
      await page.waitForTimeout(300);
      return true;
    }
    await answerWheel(page);
    await answerForecast(page);
    const check = page.getByRole("button", { name: /^check$/i }).first();
    if (
      (await isVisible(check)) &&
      !(await check.isDisabled().catch(() => false))
    ) {
      await check.click().catch(() => {});
      await page.waitForTimeout(250);
      const play = page.getByRole("button", { name: /play \d+ times/i }).first();
      if (await isVisible(play)) {
        await play.click().catch(() => {});
        await page.waitForTimeout(300);
      }
      continue;
    }
    if (await bruteForceGroup(page)) continue;
    return false;
  }
  return false;
}

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

  // Scene 1 (welcome CTA varies per shop: "Let's go", "Start", "Open the Shop!", ...)
  await page.getByRole("button", { name: /let's go|start|begin|open the shop|read/i }).first().click();
  await page.waitForTimeout(300);
  await runAxe(page, `${slug}-3-scene1`);

  // Try challenge if present
  const challenge1 = page.getByRole("button", { name: /try.*challenge|challenge/i }).first();
  if (await challenge1.count() && await challenge1.isVisible().catch(() => false)) {
    await challenge1.click().catch(() => {});
    await page.waitForTimeout(250);
    await runAxe(page, `${slug}-3b-scene1-challenge`);
  }

  // Advance to scene 2 (best-effort)
  await advance(page, 8);
  await runAxe(page, `${slug}-4-scene2`);

  // Advance to scene 3
  await advance(page, 16);
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

test("a11y audit: arcade", async ({ page }) => {
  test.setTimeout(180_000);
  await auditShop(page, "Lucky Stars", "arcade");
});
