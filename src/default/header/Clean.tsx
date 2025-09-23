import Img from "@/src/components/utils/ImgBase";
import Link from "next/link";
import { HeaderType } from "@/src/default/header/index";
import { UserType } from "@/src/models/user";
import Icon from "@/src/icons/fontAwesome/FIcon";

export default function Clean({
  params
}: {
  params: HeaderType;
  user: UserType;
}) {
  return (
    <>
      <header className={`flex items-center ${params.background} px-4`}>
        {!!params.backHistory && (
          <div className="block md:hidden">
            <Link passHref href={`${params.backHistory}`}>
              <div className="text-white p-2 text-xl">
                <Icon icon="fa-chevron-left" />
              </div>
            </Link>
          </div>
        )}
        <div className="max-w-[100px] md:max-w-[120px] mx-auto w-full py-2">
          <Link passHref href="/">
            <div className="aspect aspect-video -mt-2">
              <Img
                src="/images/logo.png"
                size="md"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
        </div>
        {!!params.backHistory && <div className="block md:hidden px-3"></div>}
      </header>
    </>
  );
}
