import { StoreType } from "@/src/models/store";
import Link from "next/link";
import Img from "@/src/components/utils/ImgBase";
import { getStoreUrl } from "@/src/urlHelpers";
import { getImage, moneyFormat } from "@/src/helper";

export default function Partner({ params }: { params: StoreType & { previewProducts?: any[] } }) {
  const products = (params?.previewProducts || []).slice(0, 3);
  const location = [params?.city, params?.state].filter(Boolean).join(", ");

  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 bg-white">
      {/* Store header */}
      <Link passHref href={getStoreUrl(params)}>
        <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-zinc-50 transition-colors">
          <div className="w-11 h-11 flex-shrink-0 bg-zinc-100 rounded-lg relative overflow-hidden">
            {!!params?.profile?.details?.sizes?.thumb && (
              <Img
                src={params?.profile?.base_url + params?.profile?.details?.sizes.thumb}
                className="object-cover absolute inset-0 w-full h-full"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h6 className="font-title font-bold text-sm text-zinc-900 truncate leading-tight">
              {params?.title ?? params?.companyName}
            </h6>
            {location && (
              <p className="text-[11px] text-zinc-400 truncate mt-0.5">{location}</p>
            )}
          </div>
        </div>
      </Link>

      {/* Mini product gallery */}
      {products.length > 0 && (
        <div className="px-3 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {products.map((prod: any) => {
              const img = getImage(prod?.gallery?.[0], "thumb");
              const price = prod?.priceSale || prod?.price;
              const title = prod?.title || "";
              const isRental = prod?.comercialType === "rental" || prod?.comercialType === "aluguel";

              return (
                <Link key={prod?.id || prod?.slug} passHref href={`/produtos/${prod?.store?.slug || params?.slug}/${prod?.slug}`}>
                  <div className="flex-shrink-0 w-[100px] cursor-pointer group">
                    <div className="w-full aspect-[4/3] bg-zinc-100 rounded-lg relative overflow-hidden">
                      {img ? (
                        <Img src={img} className="object-cover absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-200" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-300 text-[10px]">
                          Sem foto
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-700 font-medium truncate mt-1 leading-tight group-hover:text-cyan-600 transition-colors">
                      {title}
                    </p>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      {isRental && "a partir de "}
                      {price ? (
                        <span className="text-zinc-700 font-semibold">
                          {moneyFormat(price)}
                        </span>
                      ) : ""}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
