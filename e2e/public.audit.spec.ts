import { expect, test, type APIRequestContext, type Page, type TestInfo } from "@playwright/test";

const apiBaseURL = process.env.E2E_API_BASE_URL || "http://[::1]:3031";

function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

async function checkNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    return {
      innerWidth: window.innerWidth,
      docScrollWidth: doc ? doc.scrollWidth : 0,
      bodyScrollWidth: body ? body.scrollWidth : 0,
    };
  });

  // +2 px to avoid false positives from fractional widths.
  expect(metrics.docScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 2);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 2);
}

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

async function fetchJson(request: APIRequestContext, url: string) {
  const res = await request.get(url);
  expect(res.ok()).toBeTruthy();
  return await res.json();
}

type PickedProduct = {
  product: any;
  productUrl: string;
  storeUrl: string | null;
};

async function pickStableProduct(request: APIRequestContext): Promise<PickedProduct> {
  const payload = await fetchJson(
    request,
    `${apiBaseURL}/api/request/products?limit=40&offset=0&ordem=desc`,
  );

  const products = Array.isArray(payload?.data) ? payload.data : [];
  expect(products.length).toBeGreaterThan(0);

  const candidate =
    products.find((p: any) => {
      const hasAttrs = Array.isArray(p?.attributes) && p.attributes.length > 0;
      const requiresDate = !!p?.schedulingEnabled;
      return !hasAttrs && !requiresDate;
    }) || products[0];

  const storeData = candidate?.store;
  const storeSlug =
    typeof storeData === "object"
      ? storeData?.slug || slugify(storeData?.title || "loja")
      : "loja";
  const storeId =
    typeof storeData === "object"
      ? Number(storeData?.id)
      : Number.isFinite(Number(storeData))
        ? Number(storeData)
        : null;

  const productId = candidate?.id;
  const productSlug = candidate?.slug || slugify(candidate?.title || "produto");

  const productUrl = `/produtos/${storeSlug}/${productSlug}-${productId}/`;
  const storeUrl = storeId && Number.isFinite(storeId) ? `/${storeSlug}-${storeId}/` : null;

  return { product: candidate, productUrl, storeUrl };
}

async function pickCategorySlug(request: APIRequestContext): Promise<string | null> {
  const res = await request.get(`${apiBaseURL}/api/request/categories-paths?limit=15`);
  if (!res.ok()) return null;
  const payload = await res.json();

  const categories = payload?.data;
  if (!categories || typeof categories !== "object") return null;

  const slugs = Object.keys(categories);
  return slugs.length ? slugs[0] : null;
}

async function pickBlogSlug(request: APIRequestContext): Promise<string | null> {
  const payload = await fetchJson(request, `${apiBaseURL}/api/content/post?limit=20`);
  const raw = payload?.data;
  if (!Array.isArray(raw)) return null;
  const slug = raw.find((item: any) => typeof item === "string" && item.length > 0);
  return typeof slug === "string" ? slug : null;
}

test.describe("Public pages (desktop + mobile)", () => {
  test("home renders without horizontal overflow", async ({ page }, testInfo) => {
    const stopCapture = captureConsole(page, testInfo);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await checkNoHorizontalOverflow(page);

    await stopCapture();
  });

  test("produtos list renders and a product can be added to cart", async ({ page, request }, testInfo) => {
    const stopCapture = captureConsole(page, testInfo);

    const { productUrl } = await pickStableProduct(request);

    await page.goto("/produtos/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Produtos/i })).toBeVisible();
    await checkNoHorizontalOverflow(page);

    await page.goto(productUrl, { waitUntil: "domcontentloaded" });
    const productForm = page.locator("form.space-y-3");
    await expect(productForm).toBeVisible();
    await checkNoHorizontalOverflow(page);

    const calendar = page.locator(".react-calendar");
    await expect(calendar).toBeVisible();

    const firstEnabledDay = page
      .locator(".react-calendar__tile:not([disabled])")
      .first();
    await firstEnabledDay.click();

    await expect(
      page.locator('input[readonly][value^="Data selecionada:"]'),
    ).toBeVisible();

    const addButton = productForm.getByRole("button", { name: /^Adicionar$/ });
    await expect(addButton).toBeVisible();
    await expect(addButton).not.toHaveClass(/pointer-events-none/);

    await addButton.click();

    await expect
      .poll(async () => {
        const cookies = await page.context().cookies();
        const cartCookie = cookies.find((c) => c.name === "fiestou.cart");
        return cartCookie?.value?.length ?? 0;
      })
      .toBeGreaterThan(2);

    // Smoke: cart preview modal (open + close) should not crash.
    await page.goto("/produtos/?openCart=1", { waitUntil: "domcontentloaded" });
    const cartPreview = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(cartPreview).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(cartPreview).toBeHidden();

    await page.goto("/carrinho/", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Meu carrinho")).toBeVisible();
    await checkNoHorizontalOverflow(page);

    await stopCapture();
  });

  test("store page renders without horizontal overflow", async ({ page, request }, testInfo) => {
    const stopCapture = captureConsole(page, testInfo);

    const { storeUrl, product } = await pickStableProduct(request);
    test.skip(!storeUrl, "Produto retornou sem loja valida para montar rota.");

    await page.goto(storeUrl!, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toContainText(String(product?.store?.title || ""));
    await checkNoHorizontalOverflow(page);

    await stopCapture();
  });

  test("faq renders without horizontal overflow", async ({ page }, testInfo) => {
    const stopCapture = captureConsole(page, testInfo);

    await page.goto("/faq/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible();
    await checkNoHorizontalOverflow(page);

    await stopCapture();
  });

  test("acesso renders without horizontal overflow", async ({ page }, testInfo) => {
    const stopCapture = captureConsole(page, testInfo);

    await page.goto("/acesso/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await checkNoHorizontalOverflow(page);

    await stopCapture();
  });

  test("institutional pages render without horizontal overflow", async ({ page }, testInfo) => {
    const stopCapture = captureConsole(page, testInfo);
    const routes = ["/sobre/", "/parceiros/", "/contato/", "/blog/"];

    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.locator("body")).toBeVisible();
      await checkNoHorizontalOverflow(page);
    }

    await stopCapture();
  });

  test("blog post and category page render without horizontal overflow", async ({ page, request }, testInfo) => {
    const stopCapture = captureConsole(page, testInfo);
    const blogSlug = await pickBlogSlug(request);
    const categorySlug = await pickCategorySlug(request);

    test.skip(!blogSlug && !categorySlug, "Sem slug de blog/categoria disponivel para smoke.");

    if (blogSlug) {
      await page.goto(`/blog/${blogSlug}/`, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1")).toBeVisible();
      await checkNoHorizontalOverflow(page);
    }

    if (categorySlug) {
      await page.goto(`/categoria/${categorySlug}/`, { waitUntil: "domcontentloaded" });
      await expect(page.locator("h1")).toBeVisible();
      await checkNoHorizontalOverflow(page);
    }

    await stopCapture();
  });
});
