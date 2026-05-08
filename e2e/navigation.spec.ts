import { test, expect } from "@playwright/test";

const ROUTES = [
  { path: "/",            titlePattern: /CHAIN_DETECTIVE/  },
  { path: "/play",        titlePattern: /Case Files/       },
  { path: "/explore",     titlePattern: /Intel Feed/       },
  { path: "/leaderboard", titlePattern: /Field Agents/     },
];

test.describe("Navigation", () => {
  for (const { path, titlePattern } of ROUTES) {
    test(`${path} loads with correct title`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(titlePattern);
    });
  }

  test("navbar links are present on home page", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation").first();
    await expect(nav.getByRole("link", { name: /play|case/i })).toBeAttached();
    await expect(nav.getByRole("link", { name: /explore|intel|feed/i })).toBeAttached();
    await expect(nav.getByRole("link", { name: /leaderboard|field|agents/i })).toBeAttached();
  });

  test("sitemap.xml is accessible", async ({ page }) => {
    const res = await page.request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<urlset");
  });

  test("robots.txt is accessible", async ({ page }) => {
    const res = await page.request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("User-agent");
    expect(body).toContain("sitemap.xml");
  });
});
