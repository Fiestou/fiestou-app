import { ProductType, getPrice } from "@/src/models/product";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import Img from "@/src/components/utils/ImgBase";
import { StoreType } from "@/src/models/store";
import LikeButton from "../ui/LikeButton";
import { getImage } from "@/src/helper";

export default function Product({ product }: { product: ProductType | any }) {
  const imageCover = !!product?.gallery?.length ? product?.gallery[0] : {};

  let store: StoreType = product?.store ?? {};

  return (
    <div className="group w-full h-full flex flex-col relative rounded-xl overflow-hidden">
      <div>
        <Link passHref href={`/produtos/${product?.id}`}>
          <div className="aspect-[4.3/3] bg-zinc-100 relative overflow-hidden">
            {!!getImage(imageCover) && (
              <Img
                src={getImage(imageCover, "sm")}
                size="md"
                className="absolute scale-[1.01] group-hover:scale-[1.05] ease object-cover h-full inset-0 w-full"
              />
            )}
          </div>
        </Link>
      </div>
      <div className="p-4 flex border border-t-0 rounded-b-xl h-full">
        <div className="flex flex-col w-full h-full">
          <div className="h-full">
            <div className="">
              <Link passHref href={`/produtos/${product?.id}`}>
                <h4 className="font-title font-bold text-[1.1rem] text-zinc-900 leading-tight">
                  {product?.title}
                </h4>
              </Link>
            </div>
            <div className="w-full pt-3 flex gap-2 md:gap-2 items-center">
              <div className="w-fit">
                {product.comercialType == "selling" ? (
                  <div className="flex items-center gap-1 bg-blue-100 whitespace-nowrap text-blue-900 rounded text-xs px-2 py-1">
                    <Icon
                      icon="fa-shopping-bag"
                      className="text-xs"
                      type="far"
                    />
                    <span>Para venda</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-lime-100 whitespace-nowrap text-lime-900 rounded text-xs px-2 py-1">
                    <Icon icon="fa-clock" className="text-xs" type="far" />
                    <span>Para alugar</span>
                  </div>
                )}
              </div>
              {!!product.rate && (
                <div className="relative h-[.5rem]">
                  <div className="flex text-[.8rem] gap-1 text-zinc-200">
                    {[1, 2, 3, 4, 5].map((key) => (
                      <Icon key={key * 2000} icon="fa-star" type="fa" />
                    ))}
                  </div>
                  <div
                    style={{ width: `${(product.rate * 100) / 5}%` }}
                    className="flex absolute top-0 left-0 text-[.8rem] gap-1 text-yellow-500 overflow-hidden"
                  >
                    {[1, 2, 3, 4, 5].map((key) => (
                      <Icon key={key * 200} icon="fa-star" type="fa" />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="text-[.85rem] pt-2 text-zinc-900">
              <span className="inline-block">Fornecido por:</span>
              <Link
                passHref
                href={`/${store.slug}`}
                className="underline hover:text-yellow-500 ease inline-block pl-1"
              >
                <b> {store.title}</b>
              </Link>
            </div>
          </div>
          <div className="whitespace-nowrap pt-4">
            <div className="text-[.8rem] h-[1rem]">
              {getPrice(product).priceFromFor &&
                !!getPrice(product).priceLow ? (
                <>
                  de
                  <span className="line-through mx-1">
                    R$ {getPrice(product).priceHigh}
                  </span>
                  por
                </>
              ) : (
                "a partir de"
              )}
            </div>
            <h3 className="font-bold text-2xl text-zinc-800">
              R$ {getPrice(product).price}
            </h3>
          </div>
        </div>
        <div className="w-fit">
          <LikeButton id={parseInt(product.id)} />
        </div>
      </div>
    </div>
  );
}
