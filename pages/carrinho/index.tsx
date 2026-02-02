import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import Api from "@/src/services/api";
import React, { useEffect, useMemo, useState } from "react";
import { NextApiRequest, NextApiResponse } from "next";
import { dateBRFormat, getImage, moneyFormat } from "@/src/helper";
import { Button } from "@/src/components/ui/form";
import { RemoveToCart } from "@/src/components/pages/carrinho";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Img from "@/src/components/utils/ImgBase";
import { formatCep } from "@/src/components/utils/FormMasks";
import { CartType } from "@/src/models/cart";
import { getProductUrl } from "@/src/urlHelpers";
import { CartSummary } from "@/src/components/cart";

import {
  calculateCartResume,
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
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  const api = new Api();

  const parse = req.cookies["fiestou.cart"] ?? "";
  const cart = !!parse ? JSON.parse(parse) : [];

  let request: any = await api.content({
    method: "get",
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

type StoreMinimumOrder = {
  enabled: 0 | 1;
  value: number;
};

type StoreMinimumSummary = {
  storeId: number;
  storeTitle: string;
  enabled: boolean;
  minimumValue: number;
  subtotal: number;
  missing: number;
};

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

  // Dados mockados de minimum_order
  const MOCK_MINIMUM_ORDER = true;

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

  const applyDeliveryToCartLocal = (
    fees: { price: number; store_id: number }[],
    sanitizedZip: string,
  ): { success: boolean; message?: string } => {
    const result = applyDeliveryToCart(listCart, fees, sanitizedZip);

    if (result.success && result.updatedCart) {
      setListCart(result.updatedCart);
      saveCartToCookies(result.updatedCart);
      recalcSummary(result.updatedCart);
    }

    return { success: result.success, message: result.message };
  };

  const handleCalculateDelivery = async () => {
    const validation = validateCep(deliveryZipInput);
    if (!validation.valid) {
      setDeliveryError(validation.error ?? "CEP inválido");
      return;
    }

    const productIds = extractProductIds(listCart);
    if (!productIds.length) {
      setDeliveryError(
        "Não encontramos produtos válidos no carrinho para calcular o frete.",
      );
      return;
    }

    setDeliveryLoading(true);
    setDeliveryError(null);

    try {
      const calculation = await calculateDeliveryFees(
        apiClient,
        validation.sanitized,
        productIds,
      );

      if (!calculation.success) {
        setDeliveryError(
          calculation.error ?? "Não conseguimos calcular o frete.",
        );
        return;
      }

      const result = applyDeliveryToCartLocal(
        calculation.fees,
        validation.sanitized,
      );

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

  // Dados mockados de minimum_order
  const MockMinimumOrder = (items: CartType[]) => {
    if (!MOCK_MINIMUM_ORDER) return items;

    const mockedStoreMinimumById: Record<number, StoreMinimumOrder> = {
      1: { enabled: 1, value: 200 },
      2: { enabled: 1, value: 150 },
      3: { enabled: 0, value: 0 },
    };

    return items.map((item: any) => {
      const storeId = item?.product?.store?.id;
      if (!storeId) return item;

      const minimum_order = mockedStoreMinimumById[storeId] ?? {
        enabled: 1,
        value: 150,
      };

      return {
        ...item,
        product: {
          ...item.product,
          store: {
            ...item.product.store,
            minimum_order,
          },
        },
      };
    });
  };

  useEffect(() => {
    const initial = MockMinimumOrder(cart);
    setListCart(initial);
    recalcSummary(initial);
  }, [cart]);

  useEffect(() => {
    if (resume.deliveryZipCodes.length) {
      setDeliveryZipInput(formatCep(resume.deliveryZipCodes[0]));
    }
  }, [resume.deliveryZipCodes]);

  // Resumo de pedido mínimo por loja
  const minimumOrderSummary = useMemo<StoreMinimumSummary[]>(() => {
    const map = new Map<number, StoreMinimumSummary>();

    for (const item of listCart) {
      const store: any = item?.product?.store;
      if (!store?.id) continue;

      const enabled = !!store?.minimum_order?.enabled;
      const minimumValue = Number(store?.minimum_order?.value ?? 0);

      if (!map.has(store.id)) {
        map.set(store.id, {
          storeId: store.id,
          storeTitle: store.title ?? "Loja",
          enabled,
          minimumValue,
          subtotal: 0,
          missing: 0,
        });
      }

      const current = map.get(store.id)!;
      current.subtotal += Number(item.total ?? 0);

      current.enabled = current.enabled || enabled;
      current.minimumValue = Math.max(current.minimumValue, minimumValue);
    }

    return Array.from(map.values()).map((s) => {
      if (!s.enabled || s.minimumValue <= 0) {
        return { ...s, missing: 0 };
      }
      const missing = Math.max(0, s.minimumValue - s.subtotal);
      return { ...s, missing };
    });
  }, [listCart]);

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
                        <Icon
                          icon="fa-shopping-cart"
                          className="text-xl lg:text-3xl"
                        />
                      </div>
                    </div>
                  </div>

                  {!!listCart.length &&
                    listCart.map((item, key) => {
                      const deliveryFeeValue = Number(
                        item.details?.deliveryFee,
                      );
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
                                  "thumb",
                                ) && (
                                  <Img
                                    src={getImage(
                                      item?.product?.gallery[0],
                                      "thumb",
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

                            <div className="flex">
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
                                {item.attributes &&
                                  Array.isArray(item.attributes) &&
                                  item.attributes.length > 0 &&
                                  (() => {
                                    const attributesWithSelected =
                                      item.attributes
                                        .map((attr: any) => ({
                                          ...attr,
                                          selectedVariations: (
                                            attr.variations || []
                                          ).filter((v: any) => v.quantity > 0),
                                        }))
                                        .filter(
                                          (attr: any) =>
                                            attr.selectedVariations.length > 0,
                                        );

                                    if (attributesWithSelected.length === 0)
                                      return null;

                                    return (
                                      <div className="mt-2 pt-2 border-t border-zinc-200">
                                        {attributesWithSelected.map(
                                          (attr: any, attrIdx: number) => (
                                            <div
                                              key={attrIdx}
                                              className="mb-3 last:mb-0"
                                            >
                                              <p className="text-xs font-bold text-zinc-800 mb-1">
                                                {attr.title}
                                              </p>
                                              {attr.selectedVariations.map(
                                                (
                                                  variation: any,
                                                  varIdx: number,
                                                ) => {
                                                  const price =
                                                    variation.price ||
                                                    variation.priceValue ||
                                                    0;
                                                  const numPrice =
                                                    typeof price === "string"
                                                      ? parseFloat(
                                                          price.replace(
                                                            ",",
                                                            ".",
                                                          ),
                                                        )
                                                      : Number(price);
                                                  const quantity =
                                                    variation.quantity || 1;
                                                  const totalPrice =
                                                    numPrice * quantity;

                                                  return (
                                                    <div
                                                      key={varIdx}
                                                      className="ml-2 mb-2"
                                                    >
                                                      <div className="flex justify-between items-center gap-2 text-sm text-zinc-700">
                                                        <span className="flex items-center gap-1.5">
                                                          <span className="text-zinc-400">
                                                            •
                                                          </span>
                                                          <span>
                                                            {variation.title}
                                                          </span>
                                                        </span>
                                                        {numPrice > 0 && (
                                                          <span className="text-zinc-500 font-medium whitespace-nowrap text-xs">
                                                            R${" "}
                                                            {moneyFormat(
                                                              numPrice,
                                                            )}
                                                          </span>
                                                        )}
                                                      </div>
                                                      {quantity > 1 &&
                                                        numPrice > 0 && (
                                                          <div className="flex justify-between items-center gap-2 text-xs text-zinc-500 ml-4 mt-0.5">
                                                            <span>
                                                              Qtd: {quantity}
                                                            </span>
                                                            <span className="text-cyan-600 font-semibold">
                                                              R${" "}
                                                              {moneyFormat(
                                                                totalPrice,
                                                              )}
                                                            </span>
                                                          </div>
                                                        )}
                                                    </div>
                                                  );
                                                },
                                              )}
                                            </div>
                                          ),
                                        )}
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
                      <Icon icon="fa-shopping-bag" type="far" /> Acessar mais
                      produtos
                    </Button>
                  </div>
                </div>

                <div className="w-full md:max-w-[420px] grid gap-4">
                  {!!minimumOrderSummary.length && (
                    <div className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-title font-bold text-zinc-900 text-lg">
                          Pedido mínimo
                        </p>
                      </div>

                      <div className="mt-3 grid gap-3">
                        {minimumOrderSummary.map((s) => {
                          if (!s.enabled || s.minimumValue <= 0) {
                            return (
                              <div
                                key={s.storeId}
                                className="text-sm text-zinc-600"
                              >
                                <span className="font-semibold text-zinc-900">
                                  {s.storeTitle}
                                </span>
                                : sem pedido mínimo
                              </div>
                            );
                          }

                          const ok = s.missing === 0;

                          return (
                            <div
                              key={s.storeId}
                              className="text-sm border rounded-md p-3"
                            >
                              <div className="flex justify-between gap-3">
                                <span className="font-semibold text-zinc-900">
                                  {s.storeTitle}
                                </span>
                                <span className="text-zinc-600 whitespace-nowrap">
                                  Mín: R$ {moneyFormat(s.minimumValue)}
                                </span>
                              </div>

                              <div className="flex justify-between gap-3 mt-1">
                                <span className="text-zinc-600">
                                  Subtotal: R$ {moneyFormat(s.subtotal)}
                                </span>

                                {ok ? (
                                  <span className="font-bold text-green-600">
                                    Atingido
                                  </span>
                                ) : (
                                  <span className="font-bold text-amber-600">
                                    Falta R$ {moneyFormat(s.missing)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {minimumOrderSummary.some(
                        (s) => s.enabled && s.minimumValue > 0 && s.missing > 0,
                      ) && (
                        <p className="text-xs text-zinc-500 mt-3">
                          Você precisa atingir o mínimo por loja para finalizar.
                        </p>
                      )}
                    </div>
                  )}

                  <CartSummary
                    resume={resume}
                    listCart={listCart}
                    deliveryZipInput={deliveryZipInput}
                    deliveryLoading={deliveryLoading}
                    deliveryError={deliveryError}
                    onZipChange={(value) => {
                      setDeliveryZipInput(value);
                      setDeliveryError(null);
                    }}
                    onCalculateDelivery={handleCalculateDelivery}
                  />
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
