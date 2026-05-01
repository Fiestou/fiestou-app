import { StoreType } from "@/src/models/store";
import Link from "next/link";
import Img from "@/src/components/utils/ImgBase";
import { getStoreUrl } from "@/src/urlHelpers";
import { getImage } from "@/src/helper";

export default function Partner({ params }: { params: StoreType & { previewProducts?: any[] } }) {
  const products = params?.previewProducts || [];
  const location = [params?.city, params?.state].filter(Boolean).join(", ");
  const segment = params?.segment;

  return (
    <Link passHref href={getStoreUrl(params)}>
      <div className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        {/* Header: logo + info */}
        <div className="flex items-center gap-3 p-3">
          <div className="w-14 h-14 flex-shrink-0 bg-zinc-100 rounded-xl relative overflow-hidden">
            {!!params?.profile?.details?.sizes?.thumb && (
              <Img
                src={params?.profile?.base_url + params?.profile?.details?.sizes.thumb}
                className="object-cover absolute inset-0 w-full h-full"
              />
            )}
          </div>
          <div className="min-w-0">
            <h6 className="font-title font-bold text-sm md:text-base text-zinc-900 truncate">
              {params?.title ?? params?.companyName}
            </h6>
            <p className="text-xs text-zinc-500 truncate">
              {segment && <span>{segment}</span>}
              {segment && location && <span className="mx-1">&bull;</span>}
              {location && <span>{location}</span>}
            </p>
          </div>
        </div>

        {/* 3 product previews */}
        {products.length > 0 && (
          <div className="grid grid-cols-3 gap-1 px-3 pb-3">
            {products.slice(0, 3).map((prod: any) => {
              const img = getImage(prod?.gallery?.[0], "thumb");
              return (
                <div key={prod?.id || prod?.slug} className="aspect-square bg-zinc-100 rounded-lg relative overflow-hidden">
                  {img ? (
                    <Img src={img} className="object-cover absolute inset-0 w-full h-full" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-300 text-xs">
                      Sem foto
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
}
