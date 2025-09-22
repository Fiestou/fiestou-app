import { StoreType } from "@/src/models/store";
import Link from "next/link";
import Img from "@/src/components/utils/ImgBase";
import Badge from "@/src/components/utils/Badge";

export default function Partner({ params }: { params: StoreType }) {
  return (
    <Link passHref href={`/${params.slug}`}>
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
          <div>
            <Badge style="light" className="text-xs md:text-sm">
              {params?.segment}
            </Badge>
            <Badge style="light" className="text-xs md:text-sm">
              {params?.city}
            </Badge>
            <Badge style="light" className="text-xs md:text-sm">
              {params?.state}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}
