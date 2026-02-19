import { expect, test, type Page, type TestInfo } from "@playwright/test";

const CLIENT_EMAIL = process.env.E2E_CLIENT_EMAIL;
const CLIENT_PASSWORD = process.env.E2E_CLIENT_PASSWORD;

function captureConsole(page: Page, testInfo: TestInfo) {
  const messages: string[] = [];

  const onConsole = (msg: any) => {
    if (msg.type() === "error") {
      messages.push(`[console.${msg.type()}] ${msg.text()}`);
    }
  };
  const onPageError = (err: Error) => {
    messages.push(`[pageerror] ${err?.message || String(err)}`);
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  return async () => {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);

    if (messages.length) {
      await testInfo.attach("console-errors.txt", {
        body: messages.join("\n"),
        contentType: "text/plain",
      });
    }
  };
}

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

test.describe("Client orders smoke", () => {
  test("client can browse orders and account data safely", async ({ page }, testInfo) => {
    test.skip(
      !CLIENT_EMAIL || !CLIENT_PASSWORD,
      "E2E_CLIENT_EMAIL/E2E_CLIENT_PASSWORD nao definidos.",
    );

    const stopCapture = captureConsole(page, testInfo);

    await login(page, CLIENT_EMAIL!, CLIENT_PASSWORD!);

    await expect
      .poll(() => page.url(), { timeout: 30_000 })
      .toContain("/dashboard");

    await page.goto("/painel", { waitUntil: "domcontentloaded" });
    await expect
      .poll(() => page.url(), { timeout: 15_000 })
      .toContain("/dashboard");

    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await expect
      .poll(() => page.url(), { timeout: 15_000 })
      .toContain("/dashboard");

    await page.goto("/dashboard/pedidos", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/Pedidos/i);
    await expect(page.locator("body")).toContainText(/Pedido #/i);

    const detailsLink = page.getByRole("link", { name: /Ver detalhes/i }).first();
    const detailsHref = await detailsLink.getAttribute("href");
    expect(detailsHref).toBeTruthy();

    await detailsLink.click();
    await expect(page.locator("body")).toContainText(/Itens do pedido/i);
    await expect(page.locator("body")).toContainText(/Pedido #/i);

    const orderIdMatch = detailsHref?.match(/\/dashboard\/pedidos\/(\d+)/);
    if (orderIdMatch?.[1]) {
      await page.goto(`/dashboard/pedidos/pagamento/${orderIdMatch[1]}`, {
        waitUntil: "domcontentloaded",
      });
      await expect(page.locator("body")).toContainText(
        /Pagamento|Resumo do pagamento|Este pedido não aceita novo pagamento/i,
      );
    }

    await page.goto("/dashboard/meus-dados", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/Meus dados/i);
    await expect(page.locator("body")).toContainText(
      /Dados da conta|Dados pessoais|Endereço principal/i,
    );

    await page.goto("/dashboard/enderecos", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/Meus endereços/i);
    await expect(page.locator("body")).toContainText(/Resumo de endereços/i);

    await page.getByRole("button", { name: /Adicionar endereço/i }).first().click();
    await expect(page.locator("body")).toContainText(/Novo endereço/i);

    const zipCodeInput = page.locator("input[name='zipCode']").first();
    await zipCodeInput.fill("58032110");
    await page.getByRole("button", { name: /Buscar CEP|Buscando CEP/i }).click();

    await expect
      .poll(async () => {
        const city = await page.locator("input[name='city']").first().inputValue();
        const state = await page.locator("input[name='state']").first().inputValue();
        return `${city}-${state}`;
      }, { timeout: 20_000 })
      .toMatch(/.+-.+/);

    await page.getByRole("button", { name: /^Cancelar$/i }).click();
    await expect(page.locator("body")).not.toContainText(/Novo endereço/i);

    await stopCapture();
  });
});
