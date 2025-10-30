import { useState, useEffect } from "react";
import { ProductType } from "@/src/models/product";

export function useProduct(product: ProductType, store?: any) {
  const [productUpdated, setProductUpdated] = useState<ProductType>(product);
  const [layout, setLayout] = useState({ isMobile: false });

  useEffect(() => {
    setLayout({ isMobile: window.innerWidth < 768 });
  }, []);

  const renderDetails = () => null; // temporário
  const renderComments = () => null; // temporário

  return {
    productUpdated,
    setProductUpdated,
    layout,
    renderDetails,
    renderComments,
  };
}
