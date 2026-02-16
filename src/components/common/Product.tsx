import { ProductType, getPrice } from "@/src/models/product";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import Img from "@/src/components/utils/ImgBase";
import { StoreType } from "@/src/models/store";
import LikeButton from "../ui/LikeButton";
import { getImage } from "@/src/helper";
import { getProductUrl, getStoreUrl } from "@/src/urlHelpers";
import { formatMoney } from "@/src/components/utils/Currency";
import { memo } from "react";

function ProductCard({ product }: { product: ProductType | any }) {
  const imageCover = !!product?.gallery?.length ? product?.gallery[0] : {};
  let store: StoreType = product?.store ?? {};
  const comercialType = product?.comercialType || "";

  const storeLogo = store.logo || store.image;

  const badgeConfig: Record<string, { bg: string; text: string; icon: string; label: string }> = {
    venda: { bg: "bg-red-50", text: "text-red-700", icon: "fa-tag", label: "Venda" },
    aluguel: { bg: "bg-blue-50", text: "text-blue-700", icon: "fa-clock", label: "Aluguel" },
    comestivel: { bg: "bg-amber-50", text: "text-amber-700", icon: "fa-utensils", label: "Comestível" },
    servicos: { bg: "bg-purple-50", text: "text-purple-700", icon: "fa-briefcase", label: "Serviços" },
  };

  const badge = badgeConfig[comercialType];
  const priceInfo = getPrice(product);

  return (
    <div className="group w-full h-full flex flex-col bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-zinc-100">
      <Link passHref href={getProductUrl(product)}>
        <div className="relative aspect-[4/3] bg-zinc-50 overflow-hidden">
          {!!getImage(imageCover) && (
            <Img
              src={getImage(imageCover, "sm")}
              size="md"
              alt={product?.title ?? "Produto"}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}

          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            {badge && (
              <div className={`flex items-center gap-1.5 ${badge.bg} ${badge.text} backdrop-blur-sm rounded-full text-xs font-medium px-3 py-1.5 shadow-sm`}>
                <Icon icon={badge.icon} className="text-xs" type="far" />
                <span>{badge.label}</span>
              </div>
            )}

            <div className="ml-auto">
              <LikeButton id={Number(product?.id ?? 0)} />
            </div>
          </div>

          {priceInfo.priceFromFor && !!priceInfo.priceLow && (
            <div className="absolute bottom-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
              PROMOÇÃO
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link passHref href={getProductUrl(product)}>
          <h4 className="font-title font-bold text-base md:text-lg text-zinc-900 leading-tight mb-2 line-clamp-2 group-hover:text-cyan-600 transition-colors">
            {product?.title}
          </h4>
        </Link>

        {!!product.rate && (
          <div className="flex items-center gap-1 mb-2">
            <div className="relative flex">
              <div className="flex text-xs gap-0.5 text-zinc-200">
                {[1, 2, 3, 4, 5].map((key) => (
                  <Icon key={key} icon="fa-star" type="fa" />
                ))}
              </div>
              <div
                style={{ width: `${(product.rate * 100) / 5}%` }}
                className="flex absolute top-0 left-0 text-xs gap-0.5 text-yellow-400 overflow-hidden"
              >
                {[1, 2, 3, 4, 5].map((key) => (
                  <Icon key={key} icon="fa-star" type="fa" />
                ))}
              </div>
            </div>
            <span className="text-xs text-zinc-500 ml-1">
              {product.rate.toFixed(1)}
            </span>
          </div>
        )}

        <Link
          passHref
          href={getStoreUrl(store)}
          className="text-xs text-zinc-600 hover:text-cyan-600 transition-colors mb-3 flex items-center gap-2"
        >
          {!!getImage(storeLogo) ? (
            <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-100 flex-shrink-0">
              <Img
                src={getImage(storeLogo, "thumb")}
                alt={store?.title ?? "Loja"}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <Icon icon="fa-store" type="far" className="text-xs" />
          )}
          <span className="truncate">{store.title}</span>
        </Link>

        <div className="mt-auto pt-3 border-t border-zinc-100">
          {priceInfo.priceFromFor && !!priceInfo.priceLow && (
            <div className="text-xs text-zinc-500 mb-1">
              de{" "}
              <span className="line-through">
                R$ {formatMoney(priceInfo.priceHigh)}
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-zinc-500">a partir de</span>
            <h3 className="font-bold text-xl md:text-2xl text-zinc-900">
              R$ {formatMoney(priceInfo.price)}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

const Product = memo(ProductCard);
Product.displayName = "ProductCard";

export default Product;
