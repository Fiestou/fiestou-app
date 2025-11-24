"use client";

import { Button } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Product from "@/src/components/common/Product";

interface ProductSectionProps {
  products?: Array<any>;
}

export default function ProductSection({ products = [] }: ProductSectionProps) {
  const hasProducts = Array.isArray(products) && products.length > 0;

  return (
    <section className="py-14">
      <div className="container-medium">
        <div className="max-w-2xl mx-auto text-center pb-6 md:pb-8">
          <h2 className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2">
            Encontre a decoração perfeita para você
          </h2>
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center md:pt-6">
          <div className="order-3 md:order-2 grid md:grid-cols-2 lg:grid-cols-4 gap-4 w-full relative overflow-hidden">
            {hasProducts ? (
              products.map((item: any, key: number) => (
                <Product key={key} product={item} />
              ))
            ) : (
              <p className="text-center text-gray-500 w-full py-10">
                Nenhum produto disponível no momento.
              </p>
            )}
          </div>
        </div>

        {hasProducts && (
          <div className="text-center mt-10">
            <Button href="/produtos">
              <Icon icon="fa-shopping-bag" type="far" /> Ver todos os produtos
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
