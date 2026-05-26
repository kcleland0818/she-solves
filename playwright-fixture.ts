// Local fixture — re-exports @playwright/test directly so the suite runs
// without the (non-public) lovable-agent-playwright-config package.
// BASE_URL drives where tests point (preview, published, or localhost).
export { test, expect } from "@playwright/test";
