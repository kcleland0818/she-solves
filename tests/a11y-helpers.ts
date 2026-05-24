import * as fs from "fs";
import * as path from "path";

export const axeSource = fs.readFileSync(
  path.resolve("node_modules/axe-core/axe.min.js"),
  "utf8"
);

/**
 * Fast, deterministic "app is ready" wait that avoids `networkidle`.
 *
 * The Lovable preview iframe keeps a persistent connection open for HMR /
 * websocket traffic, so `page.waitForLoadState("networkidle")` reliably
 * stalls until Playwright's action timeout fires. Instead we:
 *   1. wait for the DOM to parse (`domcontentloaded`)
 *   2. wait for an app-rendered marker (the React root has children, or a
 *      known landmark like `#shop-markers` for the town map)
 *
 * `selector` defaults to "#root > *" which fires as soon as React has
 * mounted anything — works for every route.
 */
export async function gotoAndReady(
  page: any,
  url: string,
  selector = "#root > *",
  timeout = 10_000
) {
  await page.goto(url);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector(selector, { state: "attached", timeout });
}

export async function runAxe(page: any, label: string) {
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
      sample: v.nodes[0]?.html?.slice(0, 220),
      target: v.nodes[0]?.target,
    })),
  };
  console.log("AXE_RESULT::" + JSON.stringify(summary));
}
