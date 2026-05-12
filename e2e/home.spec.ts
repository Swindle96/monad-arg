import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders hero headline", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /CHAIN/i }).first()).toBeVisible();
  });

  test("has skip-to-content link", async ({ page }) => {
    const skipLink = page.getByRole("link", { name: "Skip to content" });
    await expect(skipLink).toBeAttached();
  });

  test("case stats are visible", async ({ page }) => {
    await expect(page.getByText("COMMIT·REVEAL")).toBeVisible();
    await expect(page.getByText("MONAD")).toBeVisible();
  });

  test("CTA buttons navigate correctly", async ({ page }) => {
    await page.getByRole("link", { name: "OPEN CASE FILE" }).first().click();
    await expect(page).toHaveURL(/\/play/);
  });

  test("footer navigation is present", async ({ page }) => {
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "CASE FILES" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "FIELD AGENTS" })).toBeVisible();
  });

  test("has JSON-LD structured data", async ({ page }) => {
    const ldScript = page.locator('script[type="application/ld+json"]');
    await expect(ldScript).toBeAttached();
    const content = await ldScript.textContent();
    const data = JSON.parse(content ?? "{}");
    expect(data["@type"]).toBe("WebApplication");
    expect(data.name).toBe("CHAIN_DETECTIVE");
  });

  test("page title matches metadata", async ({ page }) => {
    await expect(page).toHaveTitle(/CHAIN_DETECTIVE/);
  });
});
