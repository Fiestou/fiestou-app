import { useState } from "react";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";

export default function Login({ content }: any) {
  const [dropdown, setDropdown] = useState(false as boolean);

  return (
    <div className="md:relative">
      <div
        onClick={() => setDropdown(!dropdown)}
        className="flex items-center gap-2 lg:gap-4 leading-tight cursor-pointer"
      >
        <div>
          <Icon icon="fa-user-circle" className="text-2xl lg:text-4xl" />
        </div>
        <div className="hidden md:block w-fit text-sm lg:text-base font-semibold font-title">
          <div className="whitespace-nowrap">Olá, faça seu login</div>
          <div className="whitespace-nowrap">
            ou cadastre-se
            <Icon
              icon={dropdown ? "fa-chevron-up" : "fa-chevron-down"}
              type="fa"
              className="text-xs ml-2"
            />
          </div>
        </div>
      </div>
      {dropdown && (
        <div>
          <div
            onClick={() => setDropdown(!dropdown)}
            className="fixed inset-0 bg-stone-900 opacity-25 z-20"
          ></div>
          <div className="absolute z-20 grid gap-3 text-stone-900 p-6 bg-white left-0 md:left-1/2 md:-translate-x-1/2 top-full md:rounded-md w-full md:mt-2 min-w-[250px]">
            <Link href="/acesso" className="hover:text-yellow-500 ease">
              <div className="flex justify-between items-center font-semibold">
                <span className="pb-1">Acesse ou cadastre-se</span>
                <Icon icon="fa-chevron-right" className="text-xs" />
              </div>
            </Link>
            <div>
              <hr className="my-2" />
            </div>
            {!!content?.dropdown_links &&
              content.dropdown_links.map((item: any, key: any) => (
                <Link passHref href={item.dropdown_link} key={key}>
                  <div className="hover:text-yellow-500 ease">
                    {item.dropdown_title}
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
