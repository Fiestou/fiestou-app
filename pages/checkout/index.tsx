import Template from "@/src/template";
import Cookies from "js-cookie";
import Api from "@/src/services/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  findDates,
  getImage,
  getAllowedRegionsDescription,
  isCEPInRegion,
  justNumber,
  getZipCode,
} from "@/src/helper";
import { Button } from "@/src/components/ui/form";
import { useRouter } from "next/router";
import { UserType } from "@/src/models/user";
import { AddressType } from "@/src/models/address";
import { ProductOrderType, ProductType } from "@/src/models/product";
import { StoreType } from "@/src/models/store";
import Partner from "@/src/components/common/Partner";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Img from "@/src/components/utils/ImgBase";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Link from "next/link";
import { CartType } from "@/src/models/cart";
import AddressCheckoutForm from "@/src/components/pages/checkout/AddressCheckoutForm";
import { formatCep, formatPhone } from "@/src/components/utils/FormMasks";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DeliveryItem } from "@/src/types/filtros";
import { registerOrder as registerOrderService } from "@/src/services/order";
import { dateBRFormat, moneyFormat } from "@/src/helper";

import {
  DeliveryOptions,
  TimeSlotPicker,
  DeliverySummaryEntry,
} from "@/src/components/checkout";

import {
  extractDeliveryFees,
  normalizeDeliveryItems,
  extractCartDeliveryZip,
  saveCartToCookies,
  markCartConverted,
} from "@/src/services/cart";
import {
  calculateDeliveryFees,
  applyDeliveryToCart,
} from "@/src/services/delivery";

const FormInitialType = {
  sended: false,
  loading: false,
};

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  const token = ctx.req.cookies["fiestou.authtoken"];
  if (!token) {
    return {
      redirect: {
        destination: "/acesso",
        permanent: false,
      },
    };
  }

  const parseCart = ctx.req.cookies["fiestou.cart"] ?? "";
  const cart = !!parseCart ? JSON.parse(parseCart) : [];

  let request: any = await api.bridge(
    {
      method: "post",
      url: `checkout/create`,
      data: {
        products: cart.map((item: any) => item.product),
      },
    },
    ctx
  );


  const DataSeo: any = request?.data?.DataSeo ?? {};
  const Scripts: any = request?.data?.Scripts ?? {};
  const Roles = request?.data?.Roles ?? {};

  const CheckoutPageContent = request?.data?.content ?? {};

  const user: UserType = request?.data?.user ?? {};
  const products: Array<ProductType> = request?.data?.products ?? [];

  cart.map((item: any, key: any) => {
    let handle = products.find((product: any) => product.id == item.product);

    if (!!handle) {
      cart[key]["product"] = handle;
    }
  });

  return {
    props: {
      cart: cart,
      user: user,
      token: !!token,
      products: products,
      Roles: Roles,
      CheckoutPageContent: CheckoutPageContent,
      DataSeo: DataSeo ?? {},
      Scripts: Scripts ?? {},
    },
  };
}

export default function Checkout({
  cart,
  user,
  token,
  products,
  Roles,
  CheckoutPageContent,
  DataSeo,
  Scripts,
}: {
  cart: Array<CartType>;
  user: UserType;
  token: boolean;
  products: Array<ProductType>;
  Roles: any;
  CheckoutPageContent: any;
  DataSeo: any;
  Scripts: any;
}) {
  const api = useMemo(() => new Api(), []);
  const allowedRegionsDescription = getAllowedRegionsDescription();

  const platformCommission = Roles?.platformCommission ?? 5;

  const [cartItems, setCartItems] = useState<Array<CartType>>(cart);

  const storesById = useMemo(() => {
    const map = new Map<number, StoreType>();

    const registerStore = (candidate: any) => {
      if (!candidate || typeof candidate !== "object") {
        return;
      }

      const idRaw = (candidate as any)?.id ?? (candidate as any)?.store_id;
      const id = Number(idRaw);

      if (!Number.isFinite(id)) {
        return;
      }

      if (!map.has(id)) {
        map.set(id, candidate as StoreType);
      }
    };

    products.forEach((product: ProductType) => {
      registerStore(product?.store);
    });

    (cartItems as Array<CartType>).forEach((item: CartType) => {
      registerStore((item as any)?.product?.store);
    });

    return map;
  }, [products, cartItems]);

  const storesList = useMemo(
    () => Array.from(storesById.values()),
    [storesById]
  );

  const { isFallback } = useRouter();

  const [form, setForm] = useState(FormInitialType);

  const [schedule, setSchedule] = useState("" as string);
  const [deliveryTo, setDeliveryTo] = useState("reception" as string);

  const [customLocation, setCustomLocation] = useState(false as boolean);
  const [locations, setLocations] = useState([] as Array<AddressType>);
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [initialPhone] = useState(formatPhone(user?.phone || ""));
  const [address, setAddress] = useState({
    country: "Brasil",
  } as AddressType);
  const handleAddress = (value: any) => {
    setAddress((prevAddress) => ({
      ...prevAddress,
      ...value,
    }));
  };

  const isPhoneValid = (phone: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, "");
    return digitsOnly.length >= 10 && digitsOnly.length <= 11;
  };

  const hasChanged = useCallback(() => {
    return phone !== initialPhone;
  }, [phone, initialPhone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSavePhone = async () => {
    if (!isPhoneValid(phone)) {
      toast.error("Telefone inválido!");
      return;
    }

    try {
      await api.bridge({
        method: "post",
        url: "users/update",
        data: { phone: phone.replace(/\D/g, "") },
      });
      toast.success("Salvo com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar!");
    }
  };

  const [deliveryPrice, setDeliveryPrice] = useState<DeliveryItem[]>(() =>
    normalizeDeliveryItems(extractDeliveryFees(cart))
  );
  const lastFetchedZipRef = useRef<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const updated = cart.map((item: any) => {
      if (!item.details?.deliverySelection) {
        const pType = item.product?.delivery_type;
        const def = pType === 'pickup' ? 'pickup' : 'delivery';
        return { ...item, details: { ...item.details, deliverySelection: def } };
      }
      return item;
    });
    setCartItems(updated);
  }, [cart]);

  useEffect(() => {
    if (initialLoadDone || !cart.length) {
      return;
    }


    const initialFees = extractDeliveryFees(cart);

    if (initialFees.length) {
      const normalized = normalizeDeliveryItems(initialFees);
      setDeliveryPrice(normalized);

      const zipHolder = cart.find(
        (item: any) =>
          item?.details?.deliveryZipCode ??
          item?.details?.deliveryZipCodeFormatted
      );


      const cartZip = zipHolder
        ? justNumber(
            zipHolder.details?.deliveryZipCode ??
              zipHolder.details?.deliveryZipCodeFormatted ??
              ""
          )
        : "";

      if (cartZip.length === 8) {
        lastFetchedZipRef.current = cartZip;
      }
    }
    setInitialLoadDone(true);
  }, [cart, initialLoadDone]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const cookieCartRaw = Cookies.get("fiestou.cart");
      if (!cookieCartRaw) {
        return;
      }

      const parsedCart = JSON.parse(cookieCartRaw);
      if (!Array.isArray(parsedCart)) {
        return;
      }

      const hydratedCart = parsedCart.map((item: any) => {
        if (item?.product && typeof item.product === "object") {
          return item;
        }

        const productId =
          typeof item?.product === "object" ? item?.product?.id : item?.product;

        const productData = products.find(
          (prod: any) => prod.id === Number(productId)
        );

        return productData ? { ...item, product: productData } : item;
      });

      setCartItems(hydratedCart);

      const cookieFees = extractDeliveryFees(hydratedCart);
      if (cookieFees.length) {
        const normalized = normalizeDeliveryItems(cookieFees);
        setDeliveryPrice(normalized);

        const zipHolder = hydratedCart.find(
          (item: any) =>
            item?.details?.deliveryZipCode ??
            item?.details?.deliveryZipCodeFormatted
        );

        const cookieZip = zipHolder
          ? justNumber(
              zipHolder.details?.deliveryZipCode ??
                zipHolder.details?.deliveryZipCodeFormatted ??
                ""
            )
          : "";

        if (cookieZip.length === 8) {
          lastFetchedZipRef.current = cookieZip;
        }
      }
    } catch (error) {
      console.error("checkout: falha ao sincronizar carrinho do cookie", error);
    }
  }, [products]);

  const applyDeliveryFeesLocal = (
    fees: DeliveryItem[],
    sanitizedZip: string,
    baseCart: CartType[]
  ): boolean => {
    const result = applyDeliveryToCart(baseCart, fees, sanitizedZip);

    if (!result.success) {
      toast.error(result.message ?? "Não conseguimos calcular o frete para este CEP.");
      return false;
    }

    if (result.updatedCart) {
      setCartItems(result.updatedCart);
      saveCartToCookies(result.updatedCart);
    }

    setDeliveryPrice(normalizeDeliveryItems(fees));
    return true;
  };

  const deliverySummary = useMemo(() => {
    const entries: DeliverySummaryEntry[] = [];
    const seenStores = new Set<number>();

    deliveryPrice.forEach((item) => {
      const storeId = Number(item?.store_id);
      const price = Number(item?.price);

      if (!Number.isFinite(storeId) || !Number.isFinite(price)) {
        return;
      }

      if (seenStores.has(storeId)) {
        return;
      }

      seenStores.add(storeId);

      const store = storesById.get(storeId);
     
      let storeLogoUrl: string | null = null;

      if (
        store &&
        typeof (store as any)?.profile === "object" &&
        (store as any).profile !== null
      ) {
        storeLogoUrl =
          getImage((store as any).profile, "thumb") ||
          getImage((store as any).profile, "sm") ||
          getImage((store as any).profile);
      }

      const entry = {
        storeId,
        storeName: store?.companyName ?? store?.title ?? "Loja parceira",
        storeSlug: store?.slug,
        price,
        storeLogoUrl,
      };

      entries.push(entry);
    });

    const requiredStoreIds = Array.from(storesById.keys()).filter(storeId => {
      return cartItems.some((item: any) => {
        const pStore = item.product?.store;
        const pId = Number(typeof pStore === 'object' ? pStore?.id : pStore);
        return pId === storeId && item.details?.deliverySelection !== 'pickup';
      });
    });

    const missingStoreIds = requiredStoreIds.filter(
      (id) => !seenStores.has(id)
    );

    const total = entries.reduce((sum, entry) => sum + entry.price, 0);

    const result = {
      entries,
      total,
      missingStoreIds,
    };

    return result;
  }, [deliveryPrice, storesById, cartItems]);

  const cartDeliveryZip = useMemo(
    () => extractCartDeliveryZip(cartItems),
    [cartItems]
  );

  useEffect(() => {
    if (!cartDeliveryZip) {
      return;
    }

    const fetchAddressFromCartZip = async () => {
      const currentZip = justNumber(address?.zipCode ?? "");

      if (currentZip === cartDeliveryZip) {
        return;
      }

      

      try {
        const location = await getZipCode(cartDeliveryZip);

        if (!location?.erro) {
          setAddress((prevAddress) => ({
            ...prevAddress,
            zipCode: formatCep(cartDeliveryZip),
            street: location.logradouro || prevAddress?.street || "",
            neighborhood: location.bairro || prevAddress?.neighborhood || "",
            city: location.localidade || prevAddress?.city || "",
            state: location.uf || prevAddress?.state || "",
            country: "Brasil",
            main: true,
          }));
        } else {
         

          setAddress((prevAddress) => ({
            ...prevAddress,
            zipCode: formatCep(cartDeliveryZip),
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar endereço:", error);
        setAddress((prevAddress) => ({
          ...prevAddress,
          zipCode: formatCep(cartDeliveryZip),
        }));
      }
    };

    fetchAddressFromCartZip();
  }, [cartDeliveryZip]);

  const [loadingDeliveryPrice, setLoadingDeliveryPrice] = useState(
    false as boolean
  );

  useEffect(() => {
    if (user?.phone) {
      setPhone(formatPhone(user.phone));
    }
  }, [user?.phone]);

  useEffect(() => {
    const sanitizedZip = justNumber(address?.zipCode ?? "");

  

    if (sanitizedZip.length < 8) {
      if (lastFetchedZipRef.current && lastFetchedZipRef.current.length === 8) {
        return;
      }
      setDeliveryPrice([]);
      lastFetchedZipRef.current = null;
      return;
    }

    if (lastFetchedZipRef.current === sanitizedZip) {
      return;
    }

    lastFetchedZipRef.current = sanitizedZip;

    const getShippingPrice = async () => {
      setLoadingDeliveryPrice(true);

      try {
        const cartProductIds = cartItems
          .filter((item: any) => item.details?.deliverySelection !== 'pickup')
          .map((item: any) => {
            const productId = typeof item?.product === 'object'
              ? item?.product?.id
              : item?.product;
            return Number(productId);
          })
          .filter((id) => Number.isFinite(id) && id > 0);

        if (!cartProductIds.length) {
          setDeliveryPrice([]);
          setLoadingDeliveryPrice(false);
          return;
        }

        const data: any = await api.request({
          method: "get",
          url: `delivery-zipcodes/${sanitizedZip}`,
          data: {
            ids: cartProductIds,
          },
        });

        const rawList: DeliveryItem[] = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

        const mappedFees = rawList
          .map(
            (x: any): DeliveryItem => ({
              price: Number(x?.price) || 0,
              store_id:
                Number(x?.store_id ?? x?.storeId ?? x?.store ?? 0) || 0,
            })
          )
          .filter(
            (item: DeliveryItem) =>
              Number.isFinite(item.price) && Number.isFinite(item.store_id)
          );

        const normalizedFees = normalizeDeliveryItems(mappedFees);

        if (!normalizedFees.length) {
          setDeliveryPrice([]);
          toast.error("Não conseguimos calcular o frete para este CEP.");
          lastFetchedZipRef.current = null;
          return;
        }

        const success = applyDeliveryFeesLocal(
          normalizedFees,
          sanitizedZip,
          cartItems
        );

        if (!success) {
          setDeliveryPrice([]);
          lastFetchedZipRef.current = null;
        }
      } catch (error: any) {
        setDeliveryPrice([]);
        const message =
          error?.response?.data?.message ??
          error?.response?.data?.error ??
          error?.message ??
          "Não conseguimos calcular o frete agora. Tente novamente.";
        toast.error(message);
        lastFetchedZipRef.current = null;
      } finally {
        setLoadingDeliveryPrice(false);
      }
    };

    getShippingPrice();
  }, [address?.zipCode, cartItems, products, api]);

  const [listCart, setListCart] = useState([] as Array<CartType>);
  const [resume, setResume] = useState({} as any);
  useEffect(() => {
    let dates = cartItems.map((item: any) => item.details.dateStart);
    let subtotal = cartItems.reduce((acumulador: number, item: any) => {
      return acumulador + item.total;
    }, 0);

    setResume({
      subtotal,
      total: subtotal + deliverySummary.total,
      startDate: findDates(dates).minDate,
      endDate: findDates(dates).maxDate,
    });

    setListCart(cartItems);
  }, [cartItems, deliverySummary.total]);

  useEffect(() => {
    setLocations(user?.address ?? []);
    setAddress((user?.address ?? []).filter((addr) => !!addr.main)[0]);

    if (!!window && (!token || !user.id)) {
      Cookies.set("fiestou.redirect", "checkout", { expires: 1 });
      window.location.href = "/acesso";
    }
  }, [user, token]);

  const deliveryTotal = deliverySummary.total;



  const submitOrder = async (e: any) => {
    e.preventDefault();


      
    if (!formattedAddressZip) {
      toast.error("Informe um CEP válido para calcular o frete.");
      return;
    }

    const hasDeliveryItems = cartItems.some((item: any) => item.details?.deliverySelection !== 'pickup');

    if (hasDeliveryItems && !deliverySummary.entries.length) {
      toast.error("Calcule o frete antes de finalizar o pedido.");
      return;
    }

    if (deliverySummary.missingStoreIds.length) {
      toast.error("Ainda falta calcular o frete para todos os fornecedores.");
      return;
    }

 

    setForm({ ...form, loading: true });

    let total = deliverySummary.total;
    let listItems: Array<ProductOrderType> = [];

    cartItems.map((item: any, key: any) => {
      const cartItem = Object.assign({}, item);

      let product: any =
        products.find((prod: any) => prod.id == cartItem.product.id) ?? {};

      if (!!product.id) {
        let store: StoreType = product.store ?? {};

        const unavailableDate = [
          ...(product?.details?.unavailable ?? []),
          cartItem.details.dateStart,
        ];

        const handle = {
          ...product.details,
          unavailable: unavailableDate,
        };

        product = {
          ...product,
          details: handle,
        };

        const qty = Number(cartItem.quantity) || 1;
        const unitPrice = Number(cartItem.total) / qty;

        listItems.push({
          attributes: cartItem.attributes,
          details: cartItem.details,
          product: {
            ...product?.details,
            title: product?.title,
            id: product?.id ?? "",
            store: { id: store.id, slug: store.slug, title: store.title },
            vehicle: product?.vehicle ?? "",
            freeTax: product?.freeTax ?? "",
            fragility: product?.fragility ?? "",
            comercialType: product?.comercialType ?? "",
            schedulingTax: product?.schedulingTax ?? "",
            schedulingPeriod: product?.schedulingPeriod ?? "",
          },
          quantity: qty,
          unit_price: unitPrice,
          total: cartItem.total,
        });

        total += cartItem.total;
      }
    });

    const payload = {
      deliveryAddress: address,
      listItems,
      freights: {
        zipcode: justNumber(address?.zipCode ?? ""),
        productsIds: listItems
          .filter((item: any) => item.details?.deliverySelection !== 'pickup')
          .map((item: any) => item.product.id),
      },
      platformCommission,
      deliverySchedule: schedule,
      deliveryStatus: "pending",
      deliveryTo,
    };

    try {
      const created: any = await registerOrderService(payload);
      const firstId = created?.orders?.[0]?.id;

      if (firstId) {
        markCartConverted();
        Cookies.remove("fiestou.cart");
        window.location.href = `/dashboard/pedidos/pagamento/${firstId}`;
        return;
      }

      toast.error("Não foi possível criar seu pedido. Tente novamente.");
    } catch (err) {
      console.error("Erro ao registrar pedido:", err);
      toast.error("Erro ao registrar o pedido.");
    } finally {
      setForm({ ...form, loading: false });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const regionCookie = Cookies.get("fiestou.region");
    if (!regionCookie) {
      return;
    }

    try {
      const handle: any = JSON.parse(regionCookie);
      const regionZip = justNumber(handle?.cep ?? "");

      if (!regionZip) {
        return;
      }

      setAddress((prevAddress) => ({
        ...prevAddress,
        zipCode: formatCep(regionZip),
      }));
    } catch (error) {
      console.error("checkout: não foi possível ler fiestou.region", error);
    }
  }, []);

  const formattedAddressZip = useMemo(() => {
    const digits = justNumber(address?.zipCode ?? "");
    return digits.length === 8 ? formatCep(digits) : "";
  }, [address?.zipCode]);

  const renderDeliveryPrice = () => {

    if (!formattedAddressZip && deliverySummary.entries.length === 0) {
      return (
        <span className="text-sm text-zinc-500">
          Informe um CEP válido para calcular o frete.
        </span>
      );
    }

    if (loadingDeliveryPrice) {
      return <span className="text-sm text-zinc-500">Calculando frete...</span>;
    }

    if (!deliverySummary.entries.length) {
      return (
        <span className="text-sm text-red-500">
          Não conseguimos calcular o frete para este CEP.
        </span>
      );
    }

    const missingStoresNames = deliverySummary.missingStoreIds
      .map((id) => {
        const store = storesById.get(id);
        return store?.companyName ?? store?.title ?? null;
      })
      .filter(Boolean);
      
    return (
      <div className="grid gap-2">
        {deliverySummary.entries.map((entry) => {
          const initials = entry.storeName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0]?.toUpperCase())
            .join("");

          return (
            <div
              key={entry.storeId ?? entry.storeName}
              className="flex items-center justify-between gap-3 rounded border border-dashed border-zinc-200 px-3 py-2 bg-white"
            >
              <div className="flex items-center gap-3 min-w-0">
                {entry.storeLogoUrl ? (
                  <Img
                    src={entry.storeLogoUrl}
                    alt={entry.storeName}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-200 text-xs font-semibold flex items-center justify-center text-zinc-600">
                    {initials || "?"}
                  </div>
                )}
                <span className="truncate text-zinc-700">
                  {entry.storeName}
                </span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-zinc-900">
                <Icon icon="fa-truck" className="text-sm text-yellow-600" />
                <span>R$ {moneyFormat(entry.price)}</span>
              </div>
            </div>
          );
        })}

        {!!missingStoresNames.length && (
          <span className="text-xs text-red-500">
            Ainda precisamos do frete para: {missingStoresNames.join(", ")}.
          </span>
        )}
      </div>
    );
  };

  return !isFallback && !!token ? (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Checkout | ${DataSeo?.site_text}`,
        url: `checkout`,
      }}
      header={{
        template: "clean",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      <section className="py-4 sm:py-6 lg:py-10 min-h-screen">
        <form autoComplete="off" onSubmit={(e: any) => submitOrder(e)}>
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-6xl">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 xr:gap-12">
              {/* Coluna Principal - Formulário */}
              <div className="w-full lg:w-2/3 xl:w-[68%] space-y-6 lg:space-y-8">
                {/* Header com Breadcrumbs */}
                <div className="pb-4 lg:pb-6 border-b border-gray-200">
                  <div className="mb-3 lg:mb-4">
                    <Breadcrumbs
                      links={[
                        { url: "/produtos", name: "Produtos" },
                        { url: "/carrinho", name: "Carrinho" },
                      ]}
                    />
                  </div>
                  <div className="flex items-center">
                    <Link passHref href="/carrinho">
                      <Icon
                        icon="fa-long-arrow-left"
                        className="mr-3 lg:mr-4 text-xl lg:text-2xl text-zinc-900 hover:text-yellow-500 transition-colors"
                      />
                    </Link>
                    <h1 className="font-title font-bold text-2xl sm:text-3xl lg:text-4xl text-zinc-900">
                      Finalizar
                    </h1>
                  </div>
                </div>

                {/* Endereço de Entrega */}
                <div className="space-y-4 lg:space-y-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-zinc-800">
                    Endereço de entrega
                  </h2>

                  {/* Alertas */}
                  {!!address?.zipCode && !isCEPInRegion(address?.zipCode) && (
                    <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 sm:px-4 py-3 rounded-lg text-sm leading-relaxed">
                      <Icon
                        icon="fa-exclamation-triangle"
                        className="mt-0.5 flex-shrink-0"
                      />
                      <span>
                        Sua região ainda não está disponível para nossos
                        fornecedores.
                        {!!allowedRegionsDescription && (
                          <strong className="block mt-1 text-yellow-900">
                            Atendemos no momento: {allowedRegionsDescription}.
                          </strong>
                        )}
                      </span>
                    </div>
                  )}

                  {(!address?.complement ||
                    !address?.street ||
                    !address?.number ||
                    !address?.city ||
                    !address?.state) && (
                    <div className="flex items-start bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 sm:px-4 py-3 rounded-lg text-sm">
                      <Icon
                        icon="fa-exclamation-triangle"
                        className="mr-2 mt-0.5 flex-shrink-0"
                      />
                      <span>
                        Preencha seu endereço corretamente. Não se esqueça de
                        informar o complemento.
                      </span>
                    </div>
                  )}

                  {/* Lista de Endereços */}
                  {!!locations.length && !customLocation && (
                    <div className="space-y-3">
                      {locations.map((addr: AddressType, key: any) => (
                        <div
                          className={`${
                            addr == address
                              ? "border-yellow-400 bg-yellow-50"
                              : "border-gray-200 hover:border-gray-300"
                          } rounded-lg border cursor-pointer transition-all duration-200`}
                          key={key}
                          onClick={() => setAddress(addr)}
                        >
                          <div className="flex gap-3 p-3 sm:p-4 items-start">
                            <div className="pt-1">
                              <div
                                className={`${
                                  addr?.street == address?.street
                                    ? "border-yellow-500"
                                    : "border-gray-300"
                                } w-4 h-4 rounded-full border-2 relative flex-shrink-0`}
                              >
                                {addr?.street == address?.street && (
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                            <div className="text-sm sm:text-base leading-relaxed">
                              <div className="font-medium">
                                {addr.street}, {addr.number}
                              </div>
                              <div className="text-gray-600">
                                {addr.neighborhood} - {addr.city} | {addr.state}
                              </div>
                              <div className="text-gray-600">
                                CEP: {addr.zipCode} - {addr.country}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setCustomLocation(true)}
                        className="text-sm underline text-zinc-700 hover:text-yellow-600 transition-colors"
                      >
                        Entregar em outro endereço
                      </button>
                    </div>
                  )}

                  {!!locations.length && !!customLocation && (
                    <button
                      type="button"
                      onClick={() => setCustomLocation(false)}
                      className="text-sm underline text-zinc-700 hover:text-yellow-600 transition-colors mb-4"
                    >
                      Selecionar meu endereço
                    </button>
                  )}

                  {(!locations.length || customLocation) && (
                    <AddressCheckoutForm
                      address={address}
                      onChange={(value: any) => handleAddress(value)}
                    />
                  )}
                </div>

                {/* Verificação de Telefone */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-zinc-800">
                      Verifique seu número de telefone
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      * O Fiestou utiliza seu número exclusivamente para enviar
                      atualizações sobre o status do seu pedido.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      name="phone"
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        const formattedValue = formatPhone(rawValue);
                        setPhone(formattedValue);
                      }}
                      required
                      value={phone}
                      placeholder="Insira seu telefone aqui"
                      className={`form-control flex-1 px-3 py-2 rounded-lg border text-sm sm:text-base ${
                        phone && !isPhoneValid(phone)
                          ? "border-red-500 focus:border-red-500"
                          : !hasChanged()
                          ? "bg-gray-100 border-gray-300"
                          : "border-green-500 focus:border-green-600"
                      } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                    />
                    <Button
                      onClick={handleSavePhone}
                      disable={
                        !isPhoneValid(phone) ||
                        phone === formatPhone(user?.phone || "")
                      }
                      style="btn-yellow"
                      className="px-4 py-2 sm:px-6 whitespace-nowrap"
                    >
                      <strong>Salvar</strong>
                    </Button>
                  </div>
                  <ToastContainer position="top-right" />
                </div>

                {/* Detalhes de Entrega */}
                <div className="space-y-4 lg:space-y-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-zinc-800">
                    Detalhes de entrega
                  </h2>

                  {/* Opções de Entrega */}
                  <DeliveryOptions
                    value={deliveryTo}
                    onChange={setDeliveryTo}
                  />

                  {/* Seleção de Horário */}
                  <TimeSlotPicker
                    value={schedule}
                    onChange={setSchedule}
                    required
                  />
                </div>

                {/* Fornecedores */}
                <div className="space-y-4 lg:space-y-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-zinc-800">
                    Fornecedores
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {storesList.map((store: any, key: any) => (
                      <div key={key}>
                        <Partner params={store} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar - Resumo */}
              <div className="w-full lg:w-1/3 xl:w-[55%] lg:max-w-md">
                <div className="sticky top-4">
                  <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 sm:p-6 lg:p-8">
                    <div className="font-title font-bold text-zinc-900 text-xl lg:text-2xl mb-4 lg:mb-6">
                      Resumo
                    </div>

                    <div className="space-y-4">
                      {/* Data da Locação */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="font-semibold text-sm text-zinc-900 flex items-center">
                          <Icon
                            icon="fa-calendar"
                            className="text-sm mr-2 opacity-75 flex-shrink-0"
                          />
                          <span>Data da locação</span>
                        </div>
                        <div className="text-right text-sm">
                          <div>
                            {dateBRFormat(resume.startDate)}{" "}
                            {resume.endDate != resume.startDate
                              ? `- ${dateBRFormat(resume.endDate)}`
                              : ""}
                          </div>
                          {schedule && (
                            <div className="text-yellow-600 font-medium">
                              {schedule}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-gray-300"></div>

                      {/* Subtotal */}
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          Subtotal ({listCart.length}{" "}
                          {listCart.length == 1 ? "item" : "itens"})
                        </div>
                        <div className="font-medium">
                          R$ {moneyFormat(resume.subtotal)}
                        </div>
                      </div>

                      <div className="border-t border-gray-300"></div>

                      {/* Frete */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="font-semibold text-sm text-zinc-900 flex items-center">
                            <Icon
                              icon="fa-truck"
                              className="text-sm mr-2 opacity-75 flex-shrink-0"
                            />
                            <span>
                              Frete{" "}
                              {formattedAddressZip &&
                                `(${formattedAddressZip})`}
                            </span>
                          </div>
                          <div className="text-right font-medium text-sm text-zinc-900">
                            {loadingDeliveryPrice
                              ? "Calculando..."
                              : deliverySummary.entries.length
                              ? `R$ ${moneyFormat(deliveryTotal)}`
                              : formattedAddressZip
                              ? "—"
                              : "Informe o CEP"}
                          </div>
                        </div>
                        <div>{renderDeliveryPrice()}</div>
                      </div>

                      <div className="border-t border-gray-300"></div>

                      {/* Total */}
                      <div className="flex justify-between items-center pt-2">
                        <div className="text-lg font-bold text-zinc-900">
                          TOTAL
                        </div>
                        <div className="text-2xl lg:text-3xl text-zinc-900 font-bold">
                          R$ {moneyFormat(resume.total)}
                        </div>
                      </div>

                      {/* Termos */}
                      {!!CheckoutPageContent?.terms_list?.length && (
                        <div className="bg-gray-100 rounded-lg p-4 space-y-3 text-sm">
                          {CheckoutPageContent?.terms_list.map(
                            (term: any, key: any) => (
                              <div key={key} className="flex gap-3">
                                <div className="pt-1">
                                  <input
                                    type="checkbox"
                                    required
                                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                                  />
                                </div>
                                <div
                                  className="text-sm leading-relaxed"
                                  dangerouslySetInnerHTML={{
                                    __html: term.term_description,
                                  }}
                                ></div>
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {/* Botão de Confirmar */}
                      <div className="pt-4">
                        {(() => {
                          const missingItems = [];
                          if (!address?.zipCode || !isCEPInRegion(address?.zipCode)) missingItems.push("CEP válido");
                          if (!address?.street) missingItems.push("rua");
                          if (!address?.number) missingItems.push("número");
                          if (!address?.complement) missingItems.push("complemento");
                          if (!schedule) missingItems.push("horário");
                          if (!isPhoneValid(phone)) missingItems.push("telefone");

                          const isFormValid = missingItems.length === 0;

                          return (
                            <>
                              {isFormValid ? (
                                <Button
                                  loading={form.loading}
                                  style="btn-success"
                                  className="w-full py-4 text-base font-semibold"
                                >
                                  Confirmar e efetuar pagamento
                                </Button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    disabled
                                    className="w-full bg-gray-300 text-gray-500 border border-transparent py-4 text-base font-semibold rounded-lg cursor-not-allowed"
                                  >
                                    Confirmar e efetuar pagamento
                                  </button>
                                  <p className="text-xs text-gray-500 mt-2 text-center">
                                    Preencha: {missingItems.join(", ")}
                                  </p>
                                </>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </section>
    </Template>
  ) : (
    <></>
  );
}
