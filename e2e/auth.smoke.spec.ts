import { expect, test, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const PARTNER_EMAIL = process.env.E2E_PARTNER_EMAIL;
const PARTNER_PASSWORD = process.env.E2E_PARTNER_PASSWORD;

async function dismissBlockingUi(page: Page) {
  const selectors = [
    page.getByRole("button", { name: /ok, continuar/i }),
    page.getByRole("button", { name: /fechar/i }),
    page.getByRole("button", { name: /^fazer login$/i }).nth(1),
  ];

  for (const locator of selectors) {
    if (await locator.isVisible().catch(() => false)) {
      await locator.click({ timeout: 2000 }).catch(() => {});
    }
  }
}

async function login(page: Page, email: string, password: string) {
  await page.goto("/logout/", { waitUntil: "domcontentloaded" });
  await page.goto("/acesso/", { waitUntil: "domcontentloaded" });

  await dismissBlockingUi(page);

  const emailInput = page.getByPlaceholder("Informe seu e-mail");
  const passwordInput = page.getByPlaceholder("Insira sua senha");

  await expect(emailInput).toBeVisible({ timeout: 20_000 });
  await expect(passwordInput).toBeVisible({ timeout: 20_000 });

  await emailInput.fill(email);
  await passwordInput.fill(password);

  await page.getByRole("button", { name: "Fazer Login", exact: true }).click();
}

test.describe("Auth smoke", () => {
  test("admin login and key pages", async ({ page }) => {
    test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, "E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD nao definidos.");

    await login(page, ADMIN_EMAIL!, ADMIN_PASSWORD!);

    await expect
      .poll(() => page.url(), { timeout: 30_000 })
      .toContain("/admin");

    await page.goto("/admin/pedidos/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/Pedidos/i);

    await page.goto("/admin/recomendacoes/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/Recomenda/i);
  });

  test("partner login and panel pages", async ({ page }) => {
    test.skip(
      !PARTNER_EMAIL || !PARTNER_PASSWORD,
      "E2E_PARTNER_EMAIL/E2E_PARTNER_PASSWORD nao definidos.",
    );

    await login(page, PARTNER_EMAIL!, PARTNER_PASSWORD!);

    await expect
      .poll(() => page.url(), { timeout: 30_000 })
      .toContain("/painel");

    await page.goto("/painel/pedidos/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/Pedidos/i);

    await page.goto("/painel/financeiro/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/Financeiro|Recebimentos|Antecipa/i);
  });
});
