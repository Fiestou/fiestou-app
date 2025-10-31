import Template from "@/src/template";
import Cookies from "js-cookie";
import Api from "@/src/services/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  dateBRFormat,
  findDates,
  getImage,
  getAllowedRegionsDescription,
  isCEPInRegion,
  justNumber,
  moneyFormat,
  getZipCode,
} from "@/src/helper";
import { Button } from "@/src/components/ui/form";
import { useRouter } from "next/router";
import { UserType } from "@/src/models/user";
import { AddressType } from "@/src/models/address";
import { ProductOrderType, ProductType } from "@/src/models/product";
import { StoreType } from "@/src/models/store";
import { OrderType } from "@/src/models/order";
import Partner from "@/src/components/common/Partner";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { CartType } from "@/src/models/cart";
import { deliveryToName } from "@/src/models/delivery";
import AddressCheckoutForm from "@/src/components/pages/checkout/AddressCheckoutForm";
import { formatCep, formatPhone } from "@/src/components/utils/FormMasks";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DeliveryItem } from "@/src/types/filtros";
import Img from "@/src/components/utils/ImgBase";

const FormInitialType = {
  sended: false,
  loading: false,
};

type DeliverySummaryEntry = {
  storeId: number | null;
  storeName: string;
  storeSlug?: string;
  price: number;
  storeLogoUrl?: string | null;
};

const normalizeDeliveryItems = (items: DeliveryItem[]): DeliveryItem[] => {
  const map = new Map<number, DeliveryItem>();

  items.forEach((item) => {
    const storeId = Number(item?.store_id);
    const price = Number(item?.price);

    if (!Number.isFinite(storeId) || !Number.isFinite(price)) {
      return;
    }

    map.set(storeId, { price, store_id: storeId });
  });

  return Array.from(map.values());
};

const extractDeliveryFees = (items: Array<CartType>): DeliveryItem[] => {
  return items
    .map((item) => {
      const fee = Number(item?.details?.deliveryFee);
      const storeSource =
        item?.details?.deliveryStoreId ??
        (typeof item?.product?.store === "object"
          ? (item?.product?.store as any)?.id
          : item?.product?.store);
      const storeId = Number(storeSource);

      if (!Number.isFinite(fee) || !Number.isFinite(storeId)) {
        return null;
      }

      return {
        price: fee,
        store_id: storeId,
      } as DeliveryItem;
    })
    .filter((item): item is DeliveryItem => !!item);
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

  // Dependemos apenas do CEP formatado para evitar reprocessar desnecessariamente quando o carrinho é atualizado.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setCartItems(cart);
  }, [cart]);

  // Inicializa o CEP e frete do carrinho que veio do servidor
  useEffect(() => {
    if (initialLoadDone || !cart.length) {
      return;
    }

    console.log('🛒 Checkout - Cart inicial recebido do servidor:', cart);

    const initialFees = extractDeliveryFees(cart);
    console.log('💰 Checkout - Taxas extraídas:', initialFees);

    if (initialFees.length) {
      const normalized = normalizeDeliveryItems(initialFees);
      setDeliveryPrice(normalized);
      console.log('✅ Checkout - Frete definido:', normalized);

      const zipHolder = cart.find(
        (item: any) =>
          item?.details?.deliveryZipCode ?? item?.details?.deliveryZipCodeFormatted
      );

      console.log('📍 Checkout - Item com CEP:', zipHolder);

      const cartZip = zipHolder
        ? justNumber(
            zipHolder.details?.deliveryZipCode ??
              zipHolder.details?.deliveryZipCodeFormatted ??
              ""
          )
        : "";

      console.log('📮 Checkout - CEP extraído:', cartZip);

      if (cartZip.length === 8) {
        // Marca o CEP como já buscado para evitar recálculo desnecessário
        lastFetchedZipRef.current = cartZip;
        console.log('✅ Checkout - CEP marcado como buscado:', cartZip);
        // Não seta o address aqui - deixa o useEffect de cartDeliveryZip fazer isso (linha 521-536)
      }
    } else {
      console.log('⚠️ Checkout - Nenhuma taxa de frete encontrada no carrinho');
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
      console.error(
        "checkout: falha ao sincronizar carrinho do cookie",
        error
      );
    }
  }, [products]);

  const applyDeliveryFees = (
    fees: DeliveryItem[],
    sanitizedZip: string,
    baseCart: CartType[]
  ): boolean => {
    if (!fees.length) {
      toast.error("Não conseguimos calcular o frete para este CEP.");
      return false;
    }

    const formattedZip = formatCep(sanitizedZip);
    const feeMap = new Map<number, number>();

    fees.forEach((fee) => {
      const storeId = Number(fee?.store_id);
      if (!Number.isFinite(storeId)) {
        return;
      }
      feeMap.set(storeId, Number(fee?.price) || 0);
    });

    const missingStores = new Set<string>();

    const updatedCart = baseCart.map((item) => {
      const productStore = item?.product?.store ?? {};
      const storeSource =
        item?.details?.deliveryStoreId ??
        (typeof productStore === "object"
          ? (productStore as any)?.id
          : productStore);
      const storeId = Number(storeSource);

      const details = { ...(item.details ?? {}) };
      details.deliveryZipCode = sanitizedZip;
      details.deliveryZipCodeFormatted = formattedZip;

      if (Number.isFinite(storeId) && feeMap.has(storeId)) {
        details.deliveryStoreId = storeId;
        details.deliveryFee = feeMap.get(storeId) ?? 0;
      } else {
        delete details.deliveryFee;
        missingStores.add(
          (productStore as any)?.companyName ??
            (productStore as any)?.title ??
            item?.product?.title ??
            `Produto #${item?.product?.id ?? ""}`
        );
      }

      return {
        ...item,
        details,
      };
    });

    if (missingStores.size) {
      const list = Array.from(missingStores).filter(Boolean);
      toast.error(
        list.length
          ? `Não conseguimos calcular o frete para: ${list.join(", ")}.`
          : "Não conseguimos calcular o frete para este CEP."
      );
      return false;
    }

    setCartItems(updatedCart);

    if (typeof window !== "undefined") {
      Cookies.set("fiestou.cart", JSON.stringify(updatedCart), {
        expires: 7,
      });
    }

    setDeliveryPrice(normalizeDeliveryItems(fees));
    return true;
  };

  const deliverySummary = useMemo(() => {
    console.log('💼 Calculando deliverySummary com deliveryPrice:', deliveryPrice);
    console.log('🏪 Lojas disponíveis (storesById):', Array.from(storesById.entries()));

    const entries: DeliverySummaryEntry[] = [];
    const seenStores = new Set<number>();

    deliveryPrice.forEach((item) => {
      const storeId = Number(item?.store_id);
      const price = Number(item?.price);

      console.log('🔍 Processando item:', { storeId, price, item });

      if (!Number.isFinite(storeId) || !Number.isFinite(price)) {
        console.log('❌ Item inválido (não é número finito)');
        return;
      }

      if (seenStores.has(storeId)) {
        console.log('⚠️ Loja já processada:', storeId);
        return;
      }

      seenStores.add(storeId);

      const store = storesById.get(storeId);
      console.log('🏪 Loja encontrada para ID', storeId, ':', store);

      let storeLogoUrl: string | null = null;

      if (store && typeof (store as any)?.profile === "object" && (store as any).profile !== null) {
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

      console.log('✅ Entry criado:', entry);
      entries.push(entry);
    });

    const requiredStoreIds = Array.from(storesById.keys());
    const missingStoreIds = requiredStoreIds.filter((id) => !seenStores.has(id));

    const total = entries.reduce((sum, entry) => sum + entry.price, 0);

    const result = {
      entries,
      total,
      missingStoreIds,
    };

    console.log('📊 deliverySummary final:', result);

    return result;
  }, [deliveryPrice, storesById]);

  const cartDeliveryZip = useMemo(() => {
    const itemWithZip = cartItems.find(
      (cartItem: any) =>
        cartItem?.details?.deliveryZipCode ||
        cartItem?.details?.deliveryZipCodeFormatted
    );

    if (!itemWithZip) {
      return "";
    }

    const rawZip =
      itemWithZip.details?.deliveryZipCode ??
      itemWithZip.details?.deliveryZipCodeFormatted ??
      "";
    const sanitized = justNumber(rawZip);
    return sanitized.length === 8 ? sanitized : "";
  }, [cartItems]);

  useEffect(() => {
    if (!cartDeliveryZip) {
      return;
    }

    const fetchAddressFromCartZip = async () => {
      const currentZip = justNumber(address?.zipCode ?? "");

      // Se o CEP já está preenchido e é o mesmo do carrinho, não faz nada
      if (currentZip === cartDeliveryZip) {
        console.log('✅ CEP do carrinho já está no endereço:', cartDeliveryZip);
        return;
      }

      console.log('🔍 Buscando endereço automaticamente para CEP do carrinho:', cartDeliveryZip);

      try {
        // Busca os dados do endereço pela API do ViaCEP
        const location = await getZipCode(cartDeliveryZip);

        if (!location?.erro) {
          console.log('✅ Endereço encontrado:', location);

          // Popula todos os campos do endereço automaticamente
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

          console.log('✅ Endereço preenchido automaticamente do carrinho!');
        } else {
          console.log('⚠️ CEP do carrinho não encontrado na API, apenas preenchendo o campo:', cartDeliveryZip);

          // Mesmo que não encontre o endereço, preenche o CEP
          setAddress((prevAddress) => ({
            ...prevAddress,
            zipCode: formatCep(cartDeliveryZip),
          }));
        }
      } catch (error) {
        console.error('❌ Erro ao buscar endereço do carrinho:', error);

        // Em caso de erro, apenas preenche o CEP
        setAddress((prevAddress) => ({
          ...prevAddress,
          zipCode: formatCep(cartDeliveryZip),
        }));
      }
    };

    fetchAddressFromCartZip();
  }, [cartDeliveryZip]);

  const [loadingDeliveryPrice, setLoadingDeliveryPrice] = useState(false as boolean);

  useEffect(() => {
    if (user?.phone) {
      setPhone(formatPhone(user.phone));
    }
  }, [user?.phone]);

  useEffect(() => {
    const sanitizedZip = justNumber(address?.zipCode ?? "");

    console.log('🔄 useEffect address.zipCode disparou:', { sanitizedZip, lastFetched: lastFetchedZipRef.current, currentDeliveryPrice: deliveryPrice });

    // Se o CEP está incompleto MAS já temos um lastFetched válido, não limpa
    if (sanitizedZip.length < 8) {
      if (lastFetchedZipRef.current && lastFetchedZipRef.current.length === 8) {
        console.log('⚠️ CEP incompleto mas já temos dados do carrinho, mantendo deliveryPrice');
        return; // Mantém os dados do carrinho
      }
      console.log('🧹 Limpando deliveryPrice pois CEP < 8 e sem dados do carrinho');
      setDeliveryPrice([]);
      lastFetchedZipRef.current = null;
      return;
    }

    if (lastFetchedZipRef.current === sanitizedZip) {
      console.log('✅ CEP já foi buscado, pulando recálculo');
      return;
    }

    console.log('🔍 Buscando frete para novo CEP:', sanitizedZip);
    lastFetchedZipRef.current = sanitizedZip;

    const getShippingPrice = async () => {
      setLoadingDeliveryPrice(true);

      try {
        const data: any = await api.request({
          method: "get",
          url: `delivery-zipcodes/${sanitizedZip}`,
          data: {
            ids: products.map((product: ProductType) => product.id),
          },
        });

        const rawList: DeliveryItem[] = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

        const normalizedFees = normalizeDeliveryItems(
          rawList
            .map((x: any): DeliveryItem => ({
              price: Number(x?.price) || 0,
              store_id:
                Number(x?.store_id ?? x?.storeId ?? x?.store ?? 0) || 0,
            }))
            .filter(
              (item: DeliveryItem) =>
                Number.isFinite(item.price) && Number.isFinite(item.store_id)
            )
        );

        if (!normalizedFees.length) {
          setDeliveryPrice([]);
          toast.error("Não conseguimos calcular o frete para este CEP.");
          lastFetchedZipRef.current = null;
          return;
        }

        const success = applyDeliveryFees(
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

    if (!deliverySummary.entries.length) {
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
          quantity: cartItem.quantity,
          total: cartItem.total,
        });

        total += cartItem.total;
      }
    });

    const order: OrderType = {
      user: user,
      listItems: listItems,
      platformCommission: platformCommission,
      total: resume.total,
      deliverySchedule: schedule,
      deliveryAddress: address,
      deliveryTo: deliveryTo,
      deliveryPrice: deliverySummary.total,
      deliveryStatus: "pending",
      status: -1,
      freights: {
        zipcode: address?.zipCode,
        productsIds: listItems.map((item: any) => item.product.id),
      },
    };

    const registerOrder: any = await api.bridge({
      method: "post",
      url: "orders/register",
      data: order,
    });

    if (!!registerOrder.response && !!registerOrder?.data?.id) {
      Cookies.remove("fiestou.cart");
      window.location.href = `/dashboard/pedidos/pagamento/${registerOrder?.data?.id}`;
    }

    setForm({ ...form, loading: false });
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
    console.log('🎨 renderDeliveryPrice chamado:', {
      formattedAddressZip,
      'address.zipCode': address?.zipCode,
      loadingDeliveryPrice,
      'deliverySummary.entries': deliverySummary.entries,
      'deliverySummary.total': deliverySummary.total,
    });

    if (!formattedAddressZip && deliverySummary.entries.length === 0) {
      return (
        <span className="text-sm text-zinc-500">
          Informe um CEP válido para calcular o frete.
        </span>
      );
    }

    if (loadingDeliveryPrice) {
      console.log('⏳ Mostrando "Calculando frete..."');
      return <span className="text-sm text-zinc-500">Calculando frete...</span>;
    }

    if (!deliverySummary.entries.length) {
      console.log('❌ Nenhuma entry encontrada, mostrando erro');
      return (
        <span className="text-sm text-red-500">
          Não conseguimos calcular o frete para este CEP.
        </span>
      );
    }

    console.log('✅ Renderizando lista de lojas:', deliverySummary.entries);

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
                <span className="truncate text-zinc-700">{entry.storeName}</span>
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
                      <Icon icon="fa-exclamation-triangle" className="mt-0.5 flex-shrink-0" />
                      <span>
                        Sua região ainda não está disponível para nossos fornecedores.
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
                          Preencha seu endereço corretamente. Não se esqueça de informar o complemento.
                        </span>
                      </div>
                    )}

                  {/* Lista de Endereços */}
                  {!!locations.length && !customLocation && (
                    <div className="space-y-3">
                      {locations.map((addr: AddressType, key: any) => (
                        <div
                          className={`${addr == address
                            ? "border-yellow-400 bg-yellow-50"
                            : "border-gray-200 hover:border-gray-300"
                            } rounded-lg border cursor-pointer transition-all duration-200`}
                          key={key}
                          onClick={() => setAddress(addr)}
                        >
                          <div className="flex gap-3 p-3 sm:p-4 items-start">
                            <div className="pt-1">
                              <div
                                className={`${addr?.street == address?.street
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
                      * O Fiestou utiliza seu número exclusivamente para enviar atualizações sobre o status do seu pedido.
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
                      className={`form-control flex-1 px-3 py-2 rounded-lg border text-sm sm:text-base ${phone && !isPhoneValid(phone)
                        ? 'border-red-500 focus:border-red-500'
                        : !hasChanged()
                          ? 'bg-gray-100 border-gray-300'
                          : 'border-green-500 focus:border-green-600'
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { type: "reception", icon: "🏢" },
                      { type: "door", icon: "🚪" },
                      { type: "for_me", icon: "📦" },
                    ].map((option: any, key: any) => (
                      <div
                        key={key}
                        onClick={() => setDeliveryTo(option.type)}
                        className={`border ${deliveryTo == option.type
                          ? "border-yellow-400 bg-yellow-50"
                          : "border-gray-200 hover:border-gray-300"
                          } p-3 lg:p-4 cursor-pointer rounded-lg transition-all duration-200 flex gap-3 items-center`}
                      >
                        <div
                          className={`${deliveryTo == option.type
                            ? "border-yellow-500"
                            : "border-gray-300"
                            } w-4 h-4 rounded-full border-2 relative flex-shrink-0`}
                        >
                          {deliveryTo == option.type && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-500 rounded-full"></div>
                          )}
                        </div>
                        <div className="text-sm font-medium leading-tight flex-1">
                          {deliveryToName[option.type]}
                        </div>
                        <span className="text-lg">{option.icon}</span>
                      </div>
                    ))}
                  </div>

                  {/* Seleção de Horário */}
                  <div className="border border-gray-200 rounded-lg p-4 relative">
                    <div className="h-0 relative overflow-hidden">
                      {!schedule && (
                        <input readOnly name="agendamento" required />
                      )}
                    </div>
                    <div className="absolute -top-3 left-3 bg-white px-2 text-sm font-medium text-gray-700">
                      Horário
                    </div>

                    <div className="mt-2">
                      <Swiper
                        spaceBetween={12}
                        breakpoints={{
                          0: {
                            slidesPerView: 3.5,
                          },
                          640: {
                            slidesPerView: 5.5,
                          },
                          1024: {
                            slidesPerView: 7.5,
                          },
                        }}
                        className="!pb-2"
                      >
                        {[
                          { period: "Manhã", time: "08:00" },
                          { period: "Manhã", time: "09:00" },
                          { period: "Manhã", time: "10:00" },
                          { period: "Manhã", time: "11:00" },
                          { period: "Manhã", time: "12:00" },
                          { period: "Tarde", time: "13:00" },
                          { period: "Tarde", time: "14:00" },
                          { period: "Tarde", time: "15:00" },
                          { period: "Tarde", time: "16:00" },
                          { period: "Tarde", time: "17:00" },
                          { period: "Noite", time: "18:00" },
                          { period: "Noite", time: "19:00" },
                          { period: "Noite", time: "20:00" },
                          { period: "Noite", time: "21:00" },
                        ].map((item: any, key) => (
                          <SwiperSlide key={key}>
                            <div
                              onClick={() =>
                                setSchedule(`${item.period} - ${item.time}`)
                              }
                              className={`${schedule == item.period + " - " + item.time
                                ? "text-yellow-600 bg-yellow-50 border-yellow-300"
                                : "text-gray-600 hover:text-gray-900 border-gray-200 hover:bg-gray-50"
                                } border rounded-lg p-3 text-center cursor-pointer transition-all duration-200`}
                            >
                              <div className="text-xs font-medium">{item.period}</div>
                              <div className="font-bold text-sm mt-1">{item.time}</div>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
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
                          {schedule && <div className="text-yellow-600 font-medium">{schedule}</div>}
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
                              Frete {formattedAddressZip && `(${formattedAddressZip})`}
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
                        {!!address?.street &&
                          !!address?.complement &&
                          !!address?.number &&
                          !!schedule &&
                          !!address?.zipCode &&
                          !!isCEPInRegion(address?.zipCode) &&
                          isPhoneValid(phone) ? (
                          <Button
                            loading={form.loading}
                            style="btn-success"
                            className="w-full py-4 text-base font-semibold"
                          >
                            Confirmar e efetuar pagamento
                          </Button>
                        ) : (
                          <button
                            type="button"
                            className="w-full bg-green-500/40 text-white border border-transparent py-4 text-base font-semibold rounded-lg cursor-not-allowed"
                          >
                            Confirmar e efetuar pagamento
                          </button>
                        )}
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
