import { StoreType } from "@/src/models/store";
import Link from "next/link";
import Img from "@/src/components/utils/ImgBase";
import Badge from "@/src/components/utils/Badge";
import { getStoreUrl } from "@/src/urlHelpers";

export default function Partner({ params }: { params: StoreType }) {
  return (
    <Link passHref href={getStoreUrl(params)}>
      <div className="flex items-center gap-4 p-2 md:p-3 border rounded-xl">
        <div className="w-1/3">
          <div className="w-full aspect-square bg-zinc-100 rounded-xl relative overflow-hidden">
            {!!params?.profile?.details?.sizes.thumb && (
              <Img
                src={
                  params?.profile?.base_url +
                  params?.profile?.details?.sizes.thumb
                }
                className="object-cover absolute inset-0 w-full h-full"
              />
            )}
          </div>
        </div>
        <div className="w-2/3 grid gap-1">
          <div>
            <h6 className="font-title font-bold text-sm md:text-[1rem] text-zinc-900">
              {params?.title ?? params?.companyName}
            </h6>
          </div>
          <div className="text-xs md:text-sm text-zinc-600">
            {params?.segment && <span>{params.segment}</span>}
            {params?.segment && (params?.city || params?.state) && <span className="mx-1">•</span>}
            {(params?.city || params?.state) && (
              <span>{[params?.city, params?.state].filter(Boolean).join(', ')}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
