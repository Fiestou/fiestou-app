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
  getCartFromCookies,
  hydrateCartProducts,
  saveCartToCookies,
  clearCartCookies,
  markCartConverted,
  buildMinimumOrderSummary,
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
    const productId = typeof item.product === 'object' ? item.product?.id : item.product;
    let handle = products.find((product: any) => product.id == productId);

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

  const { deliveryProducts, pickupProducts, deliveryStores, pickupStores } = useMemo(() => {
    const delivery: CartType[] = [];
    const pickup: CartType[] = [];
    const deliveryStoreIds = new Set<number>();
    const pickupStoreIds = new Set<number>();

    cartItems.forEach((item) => {
      const isPickup = item.product?.delivery_type === 'pickup' ||
                       item.details?.deliverySelection === 'pickup';

      let storeId = 0;
      const storeRaw = item.product?.store;
      if (typeof storeRaw === 'number') {
        storeId = storeRaw;
      } else if (typeof storeRaw === 'string') {
        storeId = parseInt(storeRaw);
      } else if (typeof storeRaw === 'object' && storeRaw !== null) {
        storeId = Number(storeRaw.id);
      }

      if (isPickup) {
        pickup.push(item);
        if (storeId > 0) pickupStoreIds.add(storeId);
      } else {
        delivery.push(item);
        if (storeId > 0) deliveryStoreIds.add(storeId);
      }
    });

    const deliveryStoresFiltered = storesList.filter(s => deliveryStoreIds.has(Number(s.id)));
    const pickupStoresFiltered = storesList.filter(s => pickupStoreIds.has(Number(s.id)));



    return {
      deliveryProducts: delivery,
      pickupProducts: pickup,
      deliveryStores: deliveryStoresFiltered,
      pickupStores: pickupStoresFiltered,
    };
  }, [cartItems, storesList]);

  const { isFallback } = useRouter();

  const [form, setForm] = useState(FormInitialType);

  const [deliverySchedules, setDeliverySchedules] = useState<Record<number, string>>({});
  const [pickupSchedules, setPickupSchedules] = useState<Record<number, string>>({});
  const [deliveryTo, setDeliveryTo] = useState("reception" as string);
  const [rulesModalStore, setRulesModalStore] = useState<any>(null);
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
  const lastFetchedDeliverySignatureRef = useRef<string>("");
  const isSubmittingRef = useRef(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const getDeliveryProductIdsFromItems = useCallback((items: CartType[]) => {
    return items
      .filter((item: any) => {
        const selection = item?.details?.deliverySelection;
        if (selection === "pickup") {
          return false;
        }

        if (selection === "delivery") {
          return true;
        }

        const deliveryType = item?.product?.delivery_type;
        if (deliveryType === "pickup" || deliveryType === "both") {
          return false;
        }

        return true;
      })
      .map((item: any) => {
        const productId =
          typeof item?.product === "object" ? item?.product?.id : item?.product;
        return Number(productId);
      })
      .filter((id: number) => Number.isFinite(id) && id > 0);
  }, []);

  const deliveryProductIds = useMemo(
    () => getDeliveryProductIdsFromItems(cartItems),
    [cartItems, getDeliveryProductIdsFromItems]
  );

  const deliverySignature = useMemo(
    () => deliveryProductIds.slice().sort((a, b) => a - b).join(","),
    [deliveryProductIds]
  );

  const hasPendingDeliverySelection = useMemo(() => {
    return cartItems.some((item: any) => {
      return (
        item?.product?.delivery_type === "both" &&
        !item?.details?.deliverySelection
      );
    });
  }, [cartItems]);

  useEffect(() => {
    const updated = cart.map((item: any) => {
      if (!item.details?.deliverySelection) {
        const pType = item.product?.delivery_type;
        if (pType === 'both') return item;
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
        const initialSignature = getDeliveryProductIdsFromItems(cart)
          .slice()
          .sort((a, b) => a - b)
          .join(",");
        lastFetchedDeliverySignatureRef.current = initialSignature;
      }
    }
    setInitialLoadDone(true);
  }, [cart, initialLoadDone, getDeliveryProductIdsFromItems]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const parsedCart = getCartFromCookies();
      if (!parsedCart.length) {
        return;
      }

      const hydratedCart = hydrateCartProducts(parsedCart, products);

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
          const hydratedSignature = getDeliveryProductIdsFromItems(hydratedCart)
            .slice()
            .sort((a, b) => a - b)
            .join(",");
          lastFetchedDeliverySignatureRef.current = hydratedSignature;
        }
      }
    } catch (error) {
      console.error("checkout: falha ao sincronizar carrinho do cookie", error);
    }
  }, [products, getDeliveryProductIdsFromItems]);

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

    if (!deliveryProductIds.length) {
      setDeliveryPrice([]);
      lastFetchedZipRef.current = null;
      lastFetchedDeliverySignatureRef.current = "";
      return;
    }

    if (sanitizedZip.length !== 8) {
      setDeliveryPrice([]);
      lastFetchedZipRef.current = null;
      lastFetchedDeliverySignatureRef.current = "";
      return;
    }

    if (
      lastFetchedZipRef.current === sanitizedZip &&
      lastFetchedDeliverySignatureRef.current === deliverySignature
    ) {
      return;
    }

    lastFetchedZipRef.current = sanitizedZip;
    lastFetchedDeliverySignatureRef.current = deliverySignature;

    let cancelled = false;

    const getShippingPrice = async () => {
      setLoadingDeliveryPrice(true);

      try {
        const calculation = await calculateDeliveryFees(
          api,
          sanitizedZip,
          deliveryProductIds
        );

        if (!calculation.success) {
          if (!cancelled) {
            setDeliveryPrice([]);
            toast.error(
              calculation.error ??
                "Não conseguimos calcular o frete para este CEP."
            );
            lastFetchedZipRef.current = null;
            lastFetchedDeliverySignatureRef.current = "";
          }
          return;
        }

        const normalizedFees = normalizeDeliveryItems(calculation.fees);

        if (!normalizedFees.length) {
          if (cancelled) {
            return;
          }
          setDeliveryPrice([]);
          toast.error("Não conseguimos calcular o frete para este CEP.");
          lastFetchedZipRef.current = null;
          lastFetchedDeliverySignatureRef.current = "";
          return;
        }

        if (cancelled) {
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
          lastFetchedDeliverySignatureRef.current = "";
        }
      } catch (error: any) {
        if (cancelled) {
          return;
        }
        setDeliveryPrice([]);
        const message =
          error?.response?.data?.message ??
          error?.response?.data?.error ??
          error?.message ??
          "Não conseguimos calcular o frete agora. Tente novamente.";
        toast.error(message);
        lastFetchedZipRef.current = null;
        lastFetchedDeliverySignatureRef.current = "";
      } finally {
        if (!cancelled) {
          setLoadingDeliveryPrice(false);
        }
      }
    };

    getShippingPrice();

    return () => {
      cancelled = true;
    };
  }, [address?.zipCode, api, cartItems, deliveryProductIds, deliverySignature]);

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
  const minimumOrderSummary = useMemo(
    () => buildMinimumOrderSummary(cartItems),
    [cartItems]
  );
  const hasMinimumOrderBlock = minimumOrderSummary.some(
    (store) => store.enabled && store.minimumValue > 0 && store.missing > 0
  );



  const submitOrder = async (e: any) => {
    e.preventDefault();

    if (form.loading || isSubmittingRef.current) {
      return;
    }

    if (!cartItems.length) {
      toast.error("Seu carrinho está vazio.");
      return;
    }

    if (hasPendingDeliverySelection) {
      toast.error(
        "Selecione entrega ou retirada para todos os itens antes de finalizar."
      );
      return;
    }

    if (hasMinimumOrderBlock) {
      toast.error(
        "O pedido mínimo por loja ainda não foi atingido para finalizar."
      );
      return;
    }

    if (!isPhoneValid(phone)) {
      toast.error("Informe um telefone válido para finalizar o pedido.");
      return;
    }

    const hasDeliveryItems = deliveryProductIds.length > 0;

    if (hasDeliveryItems) {
      if (!formattedAddressZip || !isCEPInRegion(address?.zipCode ?? "")) {
        toast.error("Informe um CEP válido para calcular o frete.");
        return;
      }

      const missingAddressFields: string[] = [];
      if (!address?.street) missingAddressFields.push("rua");
      if (!address?.number) missingAddressFields.push("número");
      if (!address?.complement) missingAddressFields.push("complemento");
      if (!address?.city) missingAddressFields.push("cidade");
      if (!address?.state) missingAddressFields.push("estado");

      if (missingAddressFields.length) {
        toast.error(
          `Preencha o endereço para entrega: ${missingAddressFields.join(", ")}.`
        );
        return;
      }
    }

    const missingDeliverySchedules = deliveryStores
      .filter((store) => !deliverySchedules[Number(store.id)])
      .map((store) => store.title ?? "Loja");
    if (missingDeliverySchedules.length) {
      toast.error(
        `Selecione horário de entrega para: ${missingDeliverySchedules.join(", ")}.`
      );
      return;
    }

    const missingPickupSchedules = pickupStores
      .filter((store) => !pickupSchedules[Number(store.id)])
      .map((store) => store.title ?? "Loja");
    if (missingPickupSchedules.length) {
      toast.error(
        `Selecione horário de retirada para: ${missingPickupSchedules.join(", ")}.`
      );
      return;
    }

    if (hasDeliveryItems && !deliverySummary.entries.length) {
      toast.error("Calcule o frete antes de finalizar o pedido.");
      return;
    }

    if (deliverySummary.missingStoreIds.length) {
      toast.error("Ainda falta calcular o frete para todos os fornecedores.");
      return;
    }

    let listItems: Array<ProductOrderType> = [];

    cartItems.forEach((item: any) => {
      const cartItem = Object.assign({}, item);
      const cartProductId =
        typeof cartItem?.product === "object"
          ? cartItem?.product?.id
          : cartItem?.product;

      let product: any =
        products.find((prod: any) => prod.id == cartProductId) ?? {};

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
      }
    });

    if (!listItems.length) {
      toast.error(
        "Não encontramos itens válidos no carrinho para criar o pedido."
      );
      return;
    }

    setForm((prev) => ({ ...prev, loading: true }));
    isSubmittingRef.current = true;

    const payload = {
      deliveryAddress: address,
      listItems,
      freights: {
        zipcode: hasDeliveryItems ? justNumber(address?.zipCode ?? "") : "",
        productsIds: hasDeliveryItems
          ? listItems
              .filter((item: any) => item.details?.deliverySelection !== "pickup")
              .map((item: any) => Number(item?.product?.id))
              .filter((id: number) => Number.isFinite(id) && id > 0)
          : [],
      },
      platformCommission,
      deliverySchedules: deliverySchedules,
      pickupSchedules: pickupSchedules,
      deliveryStatus: "pending",
      deliveryTo,
    };

    try {
      const created: any = await registerOrderService(payload);
      const firstId = created?.orders?.[0]?.id;

      if (firstId) {
        markCartConverted();
        clearCartCookies({ syncApi: false });
        window.location.href = `/dashboard/pedidos/pagamento/${firstId}`;
        return;
      }

      toast.error("Não foi possível criar seu pedido. Tente novamente.");
    } catch (err) {
      console.error("Erro ao registrar pedido:", err);
      toast.error("Erro ao registrar o pedido.");
    } finally {
      isSubmittingRef.current = false;
      setForm((prev) => ({ ...prev, loading: false }));
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
    if (!deliveryProductIds.length) {
      return (
        <span className="text-sm text-zinc-500">
          Itens configurados para retirada. Frete não é necessário.
        </span>
      );
    }

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

  const page = !isFallback && !!token ? (
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
              <div className="w-full lg:w-2/3 xl:w-[68%] space-y-6 lg:space-y-8">
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

                <div className="space-y-4 lg:space-y-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-zinc-800">
                    Endereço de entrega
                  </h2>

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

                {deliveryProducts.length > 0 && (
                  <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <div className="flex items-center gap-2">
                      <Icon icon="fa-truck" className="text-yellow-600" />
                      <h2 className="text-base font-semibold text-zinc-800">
                        Produtos para Entrega ({deliveryProducts.length})
                      </h2>
                    </div>

                    <DeliveryOptions
                      value={deliveryTo}
                      onChange={setDeliveryTo}
                    />

                    {deliveryStores.map((store) => {
                      const storeProducts = deliveryProducts.filter((item) => {
                        const storeRaw = item.product?.store;
                        let storeId = 0;
                        if (typeof storeRaw === 'number') storeId = storeRaw;
                        else if (typeof storeRaw === 'string') storeId = parseInt(storeRaw);
                        else if (typeof storeRaw === 'object' && storeRaw !== null) storeId = Number(storeRaw.id);
                        return storeId === Number(store.id);
                      });

                      return (
                        <div key={store.id} className="bg-white rounded-lg p-4 border border-blue-100 space-y-3">
                          <div className="font-medium text-zinc-800">{store.title}</div>
                          <div className="space-y-2">
                            {storeProducts.map((item, idx) => (
                              <div key={idx} className="bg-blue-50 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  {item.product?.gallery?.[0] && getImage(item.product.gallery[0], "thumb") && (
                                    <img
                                      src={getImage(item.product.gallery[0], "thumb")}
                                      alt={item.product?.title}
                                      className="w-10 h-10 rounded object-cover"
                                    />
                                  )}
                                  <div className="flex flex-col flex-1">
                                    <span className="text-sm font-medium text-zinc-800">{item.product?.title}</span>
                                    <span className="text-xs text-zinc-500">x{(item as any).quantity || 1}</span>
                                  </div>
                                </div>
                                {item.attributes && item.attributes.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-blue-100 space-y-1">
                                    {item.attributes.map((attr: any, attrIdx: number) => (
                                      <div key={attrIdx}>
                                        <p className="text-xs font-semibold text-zinc-700">{attr.title}</p>
                                        {attr.variations?.map((v: any, vIdx: number) => (
                                          <div key={vIdx} className="ml-2 flex items-center gap-2 text-xs text-zinc-600">
                                            <span>• {v.title || v.value}</span>
                                            {v.value && typeof v.value === "string" && (v.value.startsWith("http") || v.value.startsWith("/") || v.value.startsWith("data:image")) && (
                                              <img src={v.value} alt="" className="h-8 rounded border border-zinc-200 object-contain" />
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <TimeSlotPicker
                            value={deliverySchedules[Number(store.id)] || ""}
                            onChange={(val) => setDeliverySchedules(prev => ({ ...prev, [Number(store.id)]: val }))}
                            required
                            stores={[store]}
                            selectedDate={resume.startDate}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {pickupProducts.length > 0 && (
                  <div className="space-y-4 bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <div className="flex items-center gap-2">
                      <Icon icon="fa-store" className="text-yellow-600" />
                      <h2 className="text-base font-semibold text-zinc-800">
                        Produtos para Retirada na Loja ({pickupProducts.length})
                      </h2>
                    </div>

                    {pickupStores.map((store) => {
                      const storeProducts = pickupProducts.filter((item) => {
                        const storeRaw = item.product?.store;
                        let storeId = 0;
                        if (typeof storeRaw === 'number') storeId = storeRaw;
                        else if (typeof storeRaw === 'string') storeId = parseInt(storeRaw);
                        else if (typeof storeRaw === 'object' && storeRaw !== null) storeId = Number(storeRaw.id);
                        return storeId === Number(store.id);
                      });

                      return (
                        <div key={store.id} className="bg-white rounded-lg p-4 border border-amber-100 space-y-3">
                          <div className="flex items-center gap-2">
                            <Icon icon="fa-map-marker-alt" className="text-yellow-600" />
                            <div className="text-sm">
                              <span className="font-medium text-zinc-800">{store.title}</span>
                              {store.street && (
                                <span className="text-zinc-500">
                                  {" - "}{store.street}{store.number ? `, ${store.number}` : ''}
                                  {store.neighborhood && ` - ${store.neighborhood}`}
                                  {store.city && ` • ${store.city}`}{store.state && `-${store.state}`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            {storeProducts.map((item, idx) => (
                              <div key={idx} className="bg-amber-50 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  {item.product?.gallery?.[0] && getImage(item.product.gallery[0], "thumb") && (
                                    <img
                                      src={getImage(item.product.gallery[0], "thumb")}
                                      alt={item.product?.title}
                                      className="w-10 h-10 rounded object-cover"
                                    />
                                  )}
                                  <div className="flex flex-col flex-1">
                                    <span className="text-sm font-medium text-zinc-800">{item.product?.title}</span>
                                    <span className="text-xs text-zinc-500">x{(item as any).quantity || 1}</span>
                                  </div>
                                </div>
                                {item.attributes && item.attributes.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-amber-100 space-y-1">
                                    {item.attributes.map((attr: any, attrIdx: number) => (
                                      <div key={attrIdx}>
                                        <p className="text-xs font-semibold text-zinc-700">{attr.title}</p>
                                        {attr.variations?.map((v: any, vIdx: number) => (
                                          <div key={vIdx} className="ml-2 flex items-center gap-2 text-xs text-zinc-600">
                                            <span>• {v.title || v.value}</span>
                                            {v.value && typeof v.value === "string" && (v.value.startsWith("http") || v.value.startsWith("/") || v.value.startsWith("data:image")) && (
                                              <img src={v.value} alt="" className="h-8 rounded border border-zinc-200 object-contain" />
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <TimeSlotPicker
                            value={pickupSchedules[Number(store.id)] || ""}
                            onChange={(val) => setPickupSchedules(prev => ({ ...prev, [Number(store.id)]: val }))}
                            required
                            stores={[store]}
                            selectedDate={resume.startDate}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

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

              <div className="w-full lg:w-1/3 xl:w-[55%] lg:max-w-md">
                <div className="sticky top-4">
                  <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 sm:p-6 lg:p-8">
                    <div className="font-title font-bold text-zinc-900 text-xl lg:text-2xl mb-4 lg:mb-6">
                      Resumo
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="font-semibold text-sm text-zinc-900 flex items-center">
                            <Icon
                              icon="fa-calendar"
                              className="text-sm mr-2 opacity-75 flex-shrink-0"
                            />
                            <span>Data da locação</span>
                          </div>
                          <div className="text-right text-sm font-medium">
                            {dateBRFormat(resume.startDate)}{" "}
                            {resume.endDate != resume.startDate
                              ? `- ${dateBRFormat(resume.endDate)}`
                              : ""}
                          </div>
                        </div>
                        {Object.entries(deliverySchedules).map(([storeId, sched]) => {
                          const store = deliveryStores.find(s => Number(s.id) === Number(storeId));
                          return sched ? (
                            <div key={storeId} className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3">
                              <div className="flex items-center gap-2 text-yellow-700">
                                <Icon icon="fa-truck" className="text-sm flex-shrink-0" />
                                <div className="text-xs sm:text-sm">
                                  <div className="font-semibold">{store?.title}</div>
                                  <div className="font-medium">{sched}</div>
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })}
                        {Object.entries(pickupSchedules).map(([storeId, sched]) => {
                          const store = pickupStores.find(s => Number(s.id) === Number(storeId));
                          return sched ? (
                            <div key={storeId} className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3">
                              <div className="flex items-center gap-2 text-yellow-700">
                                <Icon icon="fa-store" className="text-sm flex-shrink-0" />
                                <div className="text-xs sm:text-sm">
                                  <div className="font-semibold">{store?.title}</div>
                                  <div className="font-medium">{sched}</div>
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>

                      <div className="border-t border-gray-200 my-1"></div>

                      <div className="flex justify-between items-center py-1">
                        <div className="text-sm text-zinc-600">
                          Subtotal ({listCart.length}{" "}
                          {listCart.length == 1 ? "item" : "itens"})
                        </div>
                        <div className="font-semibold text-base">
                          R$ {moneyFormat(resume.subtotal)}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 my-1"></div>

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
                              : !deliveryProductIds.length
                              ? "Sem frete"
                              : formattedAddressZip
                              ? "—"
                              : "Informe o CEP"}
                          </div>
                        </div>
                        <div>{renderDeliveryPrice()}</div>
                      </div>

                      <div className="border-t border-gray-200 my-1"></div>

                      <div className="flex justify-between items-center pt-3 pb-1">
                        <div className="text-base lg:text-lg font-bold text-zinc-900">
                          TOTAL
                        </div>
                        <div className="text-2xl lg:text-3xl text-zinc-900 font-bold">
                          R$ {moneyFormat(resume.total)}
                        </div>
                      </div>

                      {hasMinimumOrderBlock && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                          <div className="text-sm font-semibold text-amber-900">
                            Pedido mínimo pendente
                          </div>
                          <div className="mt-2 grid gap-2">
                            {minimumOrderSummary
                              .filter(
                                (store) =>
                                  store.enabled &&
                                  store.minimumValue > 0 &&
                                  store.missing > 0
                              )
                              .map((store) => (
                                <div
                                  key={store.storeId}
                                  className="text-xs text-amber-800 flex items-center justify-between gap-3"
                                >
                                  <span className="truncate">{store.storeTitle}</span>
                                  <span className="whitespace-nowrap font-semibold">
                                    Falta R$ {moneyFormat(store.missing)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {storesList.some((s: any) => s.rental_rules?.enabled) && (
                        <div className="space-y-3">
                          {storesList.filter((s: any) => s.rental_rules?.enabled).map((s: any) => {
                            const rules = s.rental_rules;
                            const profileUrl = s.profile?.base_url && s.profile?.details?.sizes?.thumb
                              ? s.profile.base_url + s.profile.details.sizes.thumb
                              : null;

                            const ruleItems: { icon: string; text: string }[] = [];
                            const returnLabels: any = { same_day: "mesmo dia", next_day: "dia seguinte", "24h": "24 horas", "48h": "48 horas" };
                            const returnText = rules.return_period === "custom" ? rules.return_period_custom : returnLabels[rules.return_period];
                            if (returnText) ruleItems.push({ icon: "fa-undo", text: `Devolução: ${returnText}` });
                            if (rules.deposit_enabled) {
                              ruleItems.push({ icon: "fa-shield", text: rules.deposit_type === "fixed" ? `Caução: R$ ${rules.deposit_value}` : `Caução: ${rules.deposit_value}% do valor` });
                            }
                            if (rules.cancellation_deadline) {
                              let cancel = `Cancelamento até ${rules.cancellation_deadline}h antes`;
                              if (rules.cancellation_fee) cancel += ` (multa ${rules.cancellation_fee}%)`;
                              ruleItems.push({ icon: "fa-ban", text: cancel });
                            }
                            if (rules.late_fee_enabled && rules.late_fee_value) {
                              ruleItems.push({ icon: "fa-clock", text: `Atraso: R$ ${rules.late_fee_value}/dia` });
                            }

                            return (
                              <div key={s.id} className="border border-gray-200 rounded-xl p-4 bg-white">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                                    {profileUrl ? (
                                      <Img src={profileUrl} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Icon icon="fa-store" className="text-sm" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm text-zinc-900 truncate">{s.title}</div>
                                    <div className="text-xs text-zinc-500">Regras de locação</div>
                                  </div>
                                </div>

                                {ruleItems.length > 0 && (
                                  <div className="space-y-1.5 mb-3 pl-1">
                                    {ruleItems.map((item, i) => (
                                      <div key={i} className="flex items-center gap-2 text-xs text-zinc-600">
                                        <Icon icon={item.icon} className="text-[10px] text-yellow-600 w-4 text-center flex-shrink-0" />
                                        <span>{item.text}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {(ruleItems.length > 0 || rules.additional_rules) && (
                                  <button
                                    type="button"
                                    onClick={() => setRulesModalStore(s)}
                                    className="text-xs text-yellow-700 hover:text-yellow-800 font-medium mb-3 flex items-center gap-1"
                                  >
                                    <Icon icon="fa-external-link" className="text-[10px]" />
                                    Ver regras completas
                                  </button>
                                )}

                                <div className="flex items-start gap-2.5 pt-2 border-t border-gray-100">
                                  <input
                                    type="checkbox"
                                    required
                                    className="mt-0.5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                                  />
                                  <span className="text-xs text-zinc-700 leading-relaxed">
                                    Li e aceito as regras de locação de <strong>{s.title}</strong>
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="pt-4">
                        {(() => {
                          const missingItems: string[] = [];

                          if (hasPendingDeliverySelection) {
                            missingItems.push("entrega/retirada de todos os itens");
                          }

                          if (hasMinimumOrderBlock) {
                            missingItems.push("pedido mínimo por loja");
                          }

                          if (deliveryProducts.length > 0) {
                            if (!address?.zipCode || !isCEPInRegion(address?.zipCode)) missingItems.push("CEP válido");
                            if (!address?.street) missingItems.push("rua");
                            if (!address?.number) missingItems.push("número");
                            if (!address?.complement) missingItems.push("complemento");
                            if (!deliverySummary.entries.length) missingItems.push("frete calculado");
                            if (deliverySummary.missingStoreIds.length) missingItems.push("frete de todas as lojas");
                            const missingDeliverySchedules = deliveryStores.filter(s => !deliverySchedules[Number(s.id)]);
                            if (missingDeliverySchedules.length > 0) {
                              missingItems.push(`horário de entrega (${missingDeliverySchedules.map(s => s.title).join(", ")})`);
                            }
                          }

                          if (pickupProducts.length > 0) {
                            const missingPickupSchedules = pickupStores.filter(s => !pickupSchedules[Number(s.id)]);
                            if (missingPickupSchedules.length > 0) {
                              missingItems.push(`horário de retirada (${missingPickupSchedules.map(s => s.title).join(", ")})`);
                            }
                          }

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

  return (
    <>
      {page}
      {rulesModalStore && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
          <div
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#000', opacity: 0.6 }}
            onClick={() => setRulesModalStore(null)}
          />
          <div className="relative flex min-h-full items-center justify-center p-4 overflow-y-auto" style={{ minHeight: '100vh' }}>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setRulesModalStore(null)}
                  className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-700 text-xl"
                >
                  <Icon icon="fa-times" />
                </button>

                <h3 className="text-lg font-bold text-zinc-900 mb-5">Regras de Locação</h3>

                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {rulesModalStore.profile?.base_url && rulesModalStore.profile?.details?.sizes?.thumb ? (
                      <Img
                        src={rulesModalStore.profile.base_url + rulesModalStore.profile.details.sizes.thumb}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Icon icon="fa-store" className="text-xl" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-base text-zinc-900">{rulesModalStore.title}</div>
                    {rulesModalStore.segment && (
                      <div className="text-sm text-zinc-500">{rulesModalStore.segment}</div>
                    )}
                  </div>
                </div>

                {(() => {
                  const rules = rulesModalStore.rental_rules;
                  const returnLabels: any = { same_day: "mesmo dia", next_day: "dia seguinte", "24h": "24 horas", "48h": "48 horas" };
                  const returnText = rules.return_period === "custom" ? rules.return_period_custom : returnLabels[rules.return_period];

                  return (
                    <div className="space-y-3">
                      {returnText && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Icon icon="fa-undo" className="text-yellow-600 mt-0.5" />
                          <div>
                            <div className="font-semibold text-sm text-zinc-900">Período de Devolução</div>
                            <div className="text-sm text-zinc-600">{returnText}</div>
                          </div>
                        </div>
                      )}

                      {rules.deposit_enabled && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Icon icon="fa-shield" className="text-yellow-600 mt-0.5" />
                          <div>
                            <div className="font-semibold text-sm text-zinc-900">Caução</div>
                            <div className="text-sm text-zinc-600">
                              {rules.deposit_type === "fixed" ? `R$ ${rules.deposit_value}` : `${rules.deposit_value}% do valor total`}
                            </div>
                          </div>
                        </div>
                      )}

                      {rules.cancellation_deadline && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Icon icon="fa-ban" className="text-yellow-600 mt-0.5" />
                          <div>
                            <div className="font-semibold text-sm text-zinc-900">Cancelamento</div>
                            <div className="text-sm text-zinc-600">
                              Até {rules.cancellation_deadline}h antes do evento
                              {rules.cancellation_fee && ` (multa de ${rules.cancellation_fee}%)`}
                            </div>
                          </div>
                        </div>
                      )}

                      {rules.late_fee_enabled && rules.late_fee_value && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Icon icon="fa-clock" className="text-yellow-600 mt-0.5" />
                          <div>
                            <div className="font-semibold text-sm text-zinc-900">Multa por Atraso</div>
                            <div className="text-sm text-zinc-600">R$ {rules.late_fee_value} por dia</div>
                          </div>
                        </div>
                      )}

                      {rules.additional_rules && (
                        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <Icon icon="fa-info-circle" className="text-amber-600 mt-0.5" />
                          <div>
                            <div className="font-semibold text-sm text-zinc-900">Observações</div>
                            <div className="text-sm text-zinc-600 whitespace-pre-line">{rules.additional_rules}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
      )}
    </>
  );
}
