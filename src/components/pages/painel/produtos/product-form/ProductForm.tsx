"use client";

import { useState } from "react";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { Button } from "@/src/components/ui/form";
import ProductAttributes from "../../../../../../pages/produtos/components/product-attributes/ProductAttributes";
import ProductQuantity from "../../../../../../pages/produtos/components/product-quantity/ProductQuantity";
import { ProductType } from "@/src/models/product";
import { useCart } from "../../../../../hooks/useCart";
import ProductShippingCalculator from "../../../../../../pages/produtos/components/product-shipping-calculator/ProductShippingCalculator";
import { formatMoney } from "@/src/components/utils/Currency";

interface ProductFormProps {
  product: ProductType;
  store: any;
  
}

export default function ProductForm({ product, store }: ProductFormProps) {
  const { productToCart, sendToCart, updateOrder, handleQuantity } =
    useCart(product);

  const [cep, setCep] = useState("");
  const [resume, setResume] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);

  const getImageAttr = (imageID: number | string) => {
    const normalizedId = Number(imageID);
    if (!Number.isFinite(normalizedId)) return null;
    return (
      product.medias?.find((media: any) => Number(media.id) === normalizedId) ??
      null
    );
  };

  const navegateImageCarousel = (imageID: number) => {
  };

  const handleCheckCep = async () => {
    if (!cep || cep.length < 8) return;

    setLoadingCep(true);
    setTimeout(() => {
      if (cep.startsWith("60")) {
        setCepError(false);
        setDeliveryFee(0); // frete grátis
      } else {
        setCepError(false);
        setDeliveryFee(29.9);
      }
      setLoadingCep(false);
    }, 1000);
  };

  const formatCep = (v: string) =>
    v
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);

  return (
    <div className="flex flex-col gap-6 w-full md:w-1/2">
      {/* Preço e título */}
      <div className="w-fit md:text-right leading-tight pt-4 md:pt-0">
        <div className="whitespace-nowrap">
          {product.priceHigh && product.priceLow && (
            <div className="text-sm">
              de
              <span className="line-through mx-1">
                R$ {formatMoney(product.priceHigh)}
              </span>
              por
            </div>
          )}
          <h3 className="font-bold text-2xl lg:text-3xl text-zinc-800">
            R$ {formatMoney(product.priceLow || product.priceHigh || 0)}
          </h3>
        </div>
      </div>

      {/* Subtítulo / Descrição resumida */}
      {!!product.subtitle && (
        <div
          onClick={() => setResume(!resume)}
          className="cursor-pointer break-words w-full whitespace-pre-wrap font-semibold text-zinc-900"
        >
          {product.subtitle}
          {resume && (
            <div className="inline-block w-0">
              <Icon icon="fa-chevron-up" type="far" className="text-xs pl-1" />
            </div>
          )}
        </div>
      )}

      {/* Atributos do produto (cores, tamanhos, adicionais etc) */}
      {Array.isArray(product.attributes) && product.attributes.length > 0 && (
        <ProductAttributes
          attributes={product.attributes}
          activeVariations={productToCart.variations ?? {}}
          updateOrder={updateOrder}
          getImageAttr={getImageAttr}
          navegateImageCarousel={navegateImageCarousel}
        />
      )}

      {/* Controle de quantidade */}
      <ProductQuantity
        quantity={productToCart.quantity ?? 1}
        onChange={handleQuantity}
      />

      {/* Cálculo de frete */}
      <ProductShippingCalculator
        cep={cep}
        setCep={setCep}
        formatCep={formatCep}
        handleCheckCep={handleCheckCep}
        loadingCep={loadingCep}
        cepError={cepError}
        deliveryFee={deliveryFee}
      />

      {/* Botão de compra */}
      <div className="pt-2">
        <Button
          type="button"
          onClick={sendToCart}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-semibold py-3 rounded-md transition-all"
        >
          <Icon icon="fa-cart-plus" type="fa" className="mr-2" />
          Adicionar ao carrinho
        </Button>
      </div>
    </div>
  );
}
