import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import Api from "@/src/services/api";
import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import { NextApiRequest, NextApiResponse } from "next";
import { dateBRFormat, getImage, moneyFormat } from "@/src/helper";
import { Button } from "@/src/components/ui/form";
import { RemoveToCart } from "@/src/components/pages/carrinho";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Img from "@/src/components/utils/ImgBase";
import { formatCep } from "@/src/components/utils/FormMasks";
import { CartType } from "@/src/models/cart";
import { getProductUrl } from "@/src/urlHelpers";

// Services
import {
  DeliverySummaryEntry,
  calculateCartResume,
  calculateAddonsTotal,
  saveCartToCookies,
  CartResume,
} from "@/src/services/cart";
import {
  validateCep,
  calculateDeliveryFees,
  applyDeliveryToCart,
  extractProductIds,
} from "@/src/services/delivery";

export async function getServerSideProps({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  const api = new Api();

  const parse = req.cookies["fiestou.cart"] ?? "";
  const cart = !!parse ? JSON.parse(parse) : [];

  let request: any = await api.content({
    method: 'get',
    url: "default",
  });

  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  request = await api.request({
    method: "get",
    url: "request/products",
    data: {
      whereIn: cart.map((item: any) => item.product),
    },
  });

  const products = request?.data ?? [];

  cart.map((item: any, key: any) => {
    let handle = products.find((prod: any) => prod.id == item.product);

    if (!!handle) {
      cart[key]["product"] = handle;
    }
  });

  return {
    props: {
      cart: cart,
      products: products,
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
  };
}

export default function Carrinho({
  cart,
  DataSeo,
  Scripts,
}: {
  cart: Array<CartType>;
  DataSeo: any;
  Scripts: any;
}) {
  const [listCart, setListCart] = useState<CartType[]>([]);
  const [resume, setResume] = useState<CartResume>({
    subtotal: 0,
    total: 0,
    delivery: 0,
    deliveryZipCodes: [],
    deliveryEntries: [],
    startDate: null,
    endDate: null,
  });
  const apiClient = useMemo(() => new Api(), []);
  const [deliveryZipInput, setDeliveryZipInput] = useState("");
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  // Usa o service para recalcular resumo do carrinho
  const recalcSummary = (items: CartType[]) => {
    const cartResume = calculateCartResume(items);
    setResume(cartResume);
  };

  const removeItemCart = (key: number) => {
    const listHandle = listCart.filter((_, index) => index !== key);

    setListCart(listHandle);
    recalcSummary(listHandle);

    RemoveToCart(key);
  };

  // Wrapper para aplicar frete usando o service
  const applyDeliveryToCartLocal = (
    fees: { price: number; store_id: number }[],
    sanitizedZip: string
  ): { success: boolean; message?: string } => {
    const result = applyDeliveryToCart(listCart, fees, sanitizedZip);

    if (result.success && result.updatedCart) {
      setListCart(result.updatedCart);
      saveCartToCookies(result.updatedCart);
      recalcSummary(result.updatedCart);
    }

    return { success: result.success, message: result.message };
  };

  // Handler de cálculo de frete usando services
  const handleCalculateDelivery = async () => {
    // 1. Valida CEP usando service
    const validation = validateCep(deliveryZipInput);
    if (!validation.valid) {
      setDeliveryError(validation.error ?? "CEP inválido");
      return;
    }

    // 2. Extrai IDs de produtos usando service
    const productIds = extractProductIds(listCart);
    if (!productIds.length) {
      setDeliveryError("Não encontramos produtos válidos no carrinho para calcular o frete.");
      return;
    }

    setDeliveryLoading(true);
    setDeliveryError(null);

    try {
      // 3. Calcula frete via API usando service
      const calculation = await calculateDeliveryFees(apiClient, validation.sanitized, productIds);

      if (!calculation.success) {
        setDeliveryError(calculation.error ?? "Não conseguimos calcular o frete.");
        return;
      }

      // 4. Aplica frete ao carrinho usando service
      const result = applyDeliveryToCartLocal(calculation.fees, validation.sanitized);

      if (!result.success) {
        setDeliveryError(result.message ?? "Não conseguimos calcular o frete.");
        return;
      }

      setDeliveryZipInput(validation.formatted);
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Não conseguimos calcular o frete agora. Tente novamente.";
      setDeliveryError(message);
    } finally {
      setDeliveryLoading(false);
    }
  };

  const handleDeliveryZipKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleCalculateDelivery();
    }
  };

  useEffect(() => {
    setListCart(cart);
    recalcSummary(cart);
  }, [cart]);

  useEffect(() => {
    if (resume.deliveryZipCodes.length) {
      setDeliveryZipInput(formatCep(resume.deliveryZipCodes[0]));
    }
  }, [resume.deliveryZipCodes]);

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Carrinho | ${DataSeo?.site_text}`,
        url: `carrinho`,
      }}
      header={{
        template: "clean",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      {!!listCart.length ? (
        <>
          <section className="py-6 md:py-10">
            <div className="container-medium pb-14">
              <div className="grid md:flex gap-4 md:gap-10 items-start">
                <div className="grid gap-6 w-full">
                  <div className="pb-4 md:pb-6 border-b">
                    <div className="pb-4">
                      <Breadcrumbs
                        links={[
                          { url: "/produtos", name: "Produtos" },
                          { url: "/carrinho", name: "Carrinho" },
                        ]}
                      />
                    </div>
                    <div className="flex items-center">
                      <Link passHref href="/produtos">
                        <Icon
                          icon="fa-long-arrow-left"
                          className="mr-4 md:mr-6 text-2xl text-zinc-900"
                        />
                      </Link>
                      <div className="font-title font-bold text-3xl md:text-4xl flex gap-4 items-center text-zinc-900">
                        Meu carrinho
                      </div>
                    </div>
                  </div>

                  {!!listCart.length &&
                    listCart.map((item, key) => {
                      const deliveryFeeValue = Number(item.details?.deliveryFee);
                      const hasDeliveryFee =
                        Number.isFinite(deliveryFeeValue) &&
                        deliveryFeeValue >= 0;
                      const rawDeliveryZip =
                        item.details?.deliveryZipCode ??
                        item.details?.deliveryZipCodeFormatted ??
                        "";
                      const formattedDeliveryZip = rawDeliveryZip
                        ? formatCep(rawDeliveryZip.toString())
                        : "";

                      return (
                        <div
                          key={key}
                          className="border-b pb-6 flex gap-2 md:gap-4"
                        >
                          <div className="w-full max-w-[4rem] pt-1">
                            <div className="aspect aspect-square rounded-md relative overflow-hidden bg-zinc-200">
                              {!!item?.product?.gallery?.length &&
                                !!getImage(
                                  item?.product?.gallery[0],
                                  "thumb"
                                ) && (
                                  <Img
                                    src={getImage(
                                      item?.product?.gallery[0],
                                      "thumb"
                                    )}
                                    size="md"
                                    className="absolute object-cover h-full inset-0 w-full"
                                  />
                                )}
                            </div>
                          </div>
                          <div className="w-full">
                            <div className="flex gap-10 items-start">
                              <div className="w-full">
                                <h5 className="font-title font-bold text-zinc-900 text-xl">
                                  <Link href={getProductUrl(item.product)}>
                                    {item.product?.title}
                                  </Link>
                                </h5>
                                <div className="mt-2 text-sm flex flex-wrap gap-1">
                                  {!!item.product?.subtitle && (
                                    <div>
                                      <div
                                        className="break-words whitespace-pre-wrap inline-block"
                                        dangerouslySetInnerHTML={{
                                          __html: item.product?.subtitle,
                                        }}
                                      ></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="w-fit text-right flex items-center gap-4">
                                <h3 className="font-bold text-xl whitespace-nowrap leading-tight text-zinc-900">
                                  R$ {moneyFormat(item.total)}
                                </h3>
                              </div>
                            </div>
                            <div className="flex items-end">
                              <div className="w-full text-sm text-zinc-600 pt-2">
                                <div className="flex gap-1">
                                  Data:
                                  <span>
                                    {dateBRFormat(item.details?.dateStart)}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  Fornecido por:
                                  <span className="font-semibold text-zinc-900">
                                    {item.product?.store?.title}
                                  </span>
                                </div>

                                {/* Adicionais/Atributos */}
                                {item.attributes && Array.isArray(item.attributes) && item.attributes.length > 0 && (() => {
                                  const attributesWithSelected = item.attributes
                                    .map((attr: any) => ({
                                      ...attr,
                                      selectedVariations: (attr.variations || []).filter((v: any) => v.quantity > 0)
                                    }))
                                    .filter((attr: any) => attr.selectedVariations.length > 0);

                                  if (attributesWithSelected.length === 0) return null;

                                  return (
                                    <div className="mt-2 pt-2 border-t border-zinc-200">
                                      {attributesWithSelected.map((attr: any, attrIdx: number) => (
                                        <div key={attrIdx} className="mb-3 last:mb-0">
                                          <p className="text-xs font-bold text-zinc-800 mb-1">{attr.title}</p>
                                          {attr.selectedVariations.map((variation: any, varIdx: number) => {
                                            const price = variation.price || variation.priceValue || 0;
                                            const numPrice = typeof price === 'string' ? parseFloat(price.replace(',', '.')) : Number(price);
                                            const quantity = variation.quantity || 1;
                                            const totalPrice = numPrice * quantity;

                                            return (
                                              <div key={varIdx} className="ml-2 mb-2">
                                                <div className="flex justify-between items-center gap-2 text-sm text-zinc-700">
                                                  <span className="flex items-center gap-1.5">
                                                    <span className="text-zinc-400">•</span>
                                                    <span>{variation.title}</span>
                                                  </span>
                                                  {numPrice > 0 && (
                                                    <span className="text-zinc-500 font-medium whitespace-nowrap text-xs">
                                                      R$ {moneyFormat(numPrice)}
                                                    </span>
                                                  )}
                                                </div>
                                                {quantity > 1 && numPrice > 0 && (
                                                  <div className="flex justify-between items-center gap-2 text-xs text-zinc-500 ml-4 mt-0.5">
                                                    <span>Qtd: {quantity}</span>
                                                    <span className="text-cyan-600 font-semibold">
                                                      R$ {moneyFormat(totalPrice)}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}

                                {hasDeliveryFee && (
                                  <div className="flex gap-1 items-center mt-1">
                                    Frete:
                                    <span className="font-semibold text-zinc-900">
                                      R$ {moneyFormat(deliveryFeeValue)}
                                    </span>
                                    {formattedDeliveryZip && (
                                      <span className="text-xs text-zinc-500">
                                        ({formattedDeliveryZip})
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div>
                                <Button
                                  style="btn-link"
                                  className="text-sm text-zinc-500 font-bold p-0"
                                  onClick={() => removeItemCart(key)}
                                >
                                  Remover
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  <div className="pt-4 md:pt-6 flex justify-center">
                    <Button
                      href={`${process.env.APP_URL}/produtos`}
                      className="md:text-lg px-4 py-2 md:py-4 md:px-8"
                    >
                      Acessar mais produtos
                    </Button>
                  </div>
                </div>

                <div className="w-full md:max-w-[28rem] md:mb-[2rem] relative">
                  <div className="rounded-2xl bg-zinc-100 p-4 md:p-8">
                    <h5 className="font-title pb-6 text-zinc-900 md:text-xl font-bold">
                      Resumo
                    </h5>

                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <div className="font-bold text-sm text-zinc-900 flex items-center">
                          <Icon
                            icon="fa-calendar"
                            className="text-sm mr-2 opacity-75"
                          />
                          Data da locação
                        </div>
                        <div className="whitespace-nowrap">
                          {dateBRFormat(resume.startDate)}{" "}
                          {resume.endDate != resume.startDate
                            ? `- ${dateBRFormat(resume.endDate)}`
                            : ""}
                        </div>
                      </div>

                      <div className="border-t"></div>

                      <div className="flex">
                        <div className="w-full whitespace-nowrap">
                          Subtotal ({listCart.length}{" "}
                          {listCart.length == 1 ? "item" : "itens"})
                        </div>
                        <div className="whitespace-nowrap">
                          R$ {moneyFormat(resume.subtotal)}
                        </div>
                      </div>

                      {/* Total de adicionais - usando service */}
                      {(() => {
                        const totalAddons = calculateAddonsTotal(listCart);
                        return totalAddons > 0 ? (
                          <>
                            <div className="border-t"></div>
                            <div className="flex justify-between">
                              <div className="w-full whitespace-nowrap text-zinc-600">
                                Adicionais
                              </div>
                              <div className="whitespace-nowrap text-cyan-600 font-semibold">
                                R$ {moneyFormat(totalAddons)}
                              </div>
                            </div>
                          </>
                        ) : null;
                      })()}

                      <div className="border-t"></div>

                      <div className="grid gap-2">
                        <div className="font-bold text-sm text-zinc-900">
                          Calcular frete
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            className="border rounded px-3 py-2 w-full sm:flex-1"
                            placeholder="Digite seu CEP"
                            value={deliveryZipInput}
                            maxLength={9}
                            onChange={(e) => {
                              setDeliveryZipInput(formatCep(e.target.value));
                              setDeliveryError(null);
                            }}
                            onKeyDown={handleDeliveryZipKeyDown}
                            disabled={deliveryLoading}
                          />
                          <Button
                            type="button"
                            style="btn-light"
                            className="sm:w-auto w-full"
                            loading={deliveryLoading}
                            disable={deliveryLoading}
                            onClick={handleCalculateDelivery}
                          >
                            Calcular
                          </Button>
                        </div>
                        {deliveryError ? (
                          <span className="text-sm text-red-500">
                            {deliveryError}
                          </span>
                        ) : !resume.deliveryEntries.length ? (
                          <span className="text-xs text-zinc-500">
                            Informe o CEP para calcular o frete antes de
                            continuar para o checkout.
                          </span>
                        ) : null}
                      </div>

                      <div className="border-t"></div>

                      {(resume.deliveryZipCodes.length > 0 ||
                        resume.delivery > 0 ||
                        resume.deliveryEntries.length > 0) && (
                        <div className="grid gap-2">
                          <div className="flex justify-between">
                            <div className="font-bold text-sm text-zinc-900 flex items-center">
                              <Icon
                                icon="fa-truck"
                                className="text-sm mr-2 opacity-75"
                              />
                              Frete
                              {resume.deliveryZipCodes.length
                                ? ` (${resume.deliveryZipCodes
                                    .map((zip) => formatCep(zip))
                                    .join(", ")})`
                                : ""}
                            </div>
                            <div className="whitespace-nowrap">
                              R$ {moneyFormat(resume.delivery)}
                            </div>
                          </div>

                          {resume.deliveryEntries.length > 0 && (
                            <div className="grid gap-2 text-sm">
                              {resume.deliveryEntries.map((entry) => {
                                const label =
                                  entry.storeName || "Entrega parceira";
                                const initials = label
                                  .split(" ")
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .map((word) => word[0]?.toUpperCase())
                                  .join("");

                                return (
                                  <div
                                    key={entry.key}
                                    className="flex items-center justify-between gap-3 rounded border border-dashed border-zinc-200 px-3 py-2 bg-white"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      {entry.storeLogoUrl ? (
                                        <Img
                                          src={entry.storeLogoUrl}
                                          alt={label}
                                          className="w-8 h-8 rounded-full object-cover border border-zinc-200"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-zinc-200 text-xs font-semibold flex items-center justify-center text-zinc-600">
                                          {initials || "?"}
                                        </div>
                                      )}
                                      <span className="truncate text-zinc-700">
                                        {label}
                                      </span>
                                    </div>
                                    <span className="font-semibold text-zinc-900">
                                      R$ {moneyFormat(entry.price)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <div className="border-t"></div>
                        </div>
                      )}

                      <div className="flex gap-2 mb-4">
                        <div className="w-full text-zinc-900 font-bold">
                          Total
                        </div>
                        <div className="text-2xl text-zinc-900 font-bold whitespace-nowrap">
                          R$ {moneyFormat(resume.total)}
                        </div>
                      </div>

                      <div className="grid fixed md:relative bottom-0 left-0 w-full p-1 md:p-0">
                        <Button
                          style="btn-success"
                          href="checkout"
                          className="py-6 mb-2 md:mb-0"
                          disable={!resume.deliveryEntries.length}
                        >
                          Confirmar e combinar entrega
                        </Button>
                        {!resume.deliveryEntries.length && (
                          <span className="text-xs text-red-500 text-center md:text-left">
                            Calcule o frete para prosseguir.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="pt-12">
          <div className="container-medium grid gap-10 text-center">
            <div className="font-title font-semibold text-2xl mt-10 text-zinc-900">
              Você ainda não adicionou itens ao carrinho
            </div>
            <div>
              <Button href="/produtos">Ver produtos</Button>
            </div>
          </div>
        </section>
      )}
    </Template>
  );
}
