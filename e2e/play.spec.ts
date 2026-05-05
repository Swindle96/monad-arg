import { test, expect } from "@playwright/test";

test.describe("Play page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/play");
  });

  test("renders case file header", async ({ page }) => {
    await expect(page.getByText(/CASE FILE/i).first()).toBeVisible();
  });

  test("shows connect wallet prompt when disconnected", async ({ page }) => {
    await expect(page.getByText(/Connect|wallet/i).first()).toBeVisible();
  });

  test("commit form is present", async ({ page }) => {
    const input = page.getByRole("textbox").first();
    await expect(input).toBeAttached();
  });

  test("block counter has aria-live region", async ({ page }) => {
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeAttached();
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Case Files.*CHAIN_DETECTIVE/i);
  });

  test("evidence panel phases are labeled", async ({ page }) => {
    await expect(page.getByText(/PHASE 01|SEAL|COMMIT/i).first()).toBeVisible();
  });
});

test.describe("Play page — reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("page loads without animation errors under prefers-reduced-motion", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    await page.goto("/play");
    await expect(page.getByText(/CASE FILE/i).first()).toBeVisible();
    expect(errors.filter(e => !e.includes("ResizeObserver"))).toHaveLength(0);
  });
});
