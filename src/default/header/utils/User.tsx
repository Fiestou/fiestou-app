import Icon from "@/src/icons/fontAwesome/FIcon";
import { menuDashboard } from "@/pages/dashboard";
import { getFirstName } from "@/src/helper";
import Link from "next/link";
import { useContext, useState } from "react";
import { Button } from "@/src/components/ui/form";
import { UserType } from "@/src/models/user";
import { signOut } from "next-auth/react";
import { AuthContext } from "@/src/contexts/AuthContext";

export default function User({ user }: { user: UserType }) {
  const { UserLogout } = useContext(AuthContext);

  const [dropdown, setDropdown] = useState<boolean>(false);

  return (
    <div className="md:relative">
      <Button
        style="btn-transparent"
        href={user.person == "client" ? "#" : "/login"}
        onClick={() => (user.person == "client" ? setDropdown(true) : {})}
        className="hover:text-yellow-300 ease text-left"
      >
        <div className="flex items-center gap-2 lg:gap-3 leading-tight cursor-pointer">
          <div>
            <Icon icon="fa-user-circle" className="text-2xl lg:text-4xl" />
          </div>
          <div className="hidden md:block w-fit text-sm lg:text-[1rem] whitespace-nowrap font-semibold font-title">
            <div className="whitespace-nowrap">
              Olá, {getFirstName(user.name)}
            </div>
            <div className="whitespace-nowrap">
              <span>Meu painel</span>
              <Icon icon="fa-chevron-down" className="text-xs ml-3" type="fa" />
            </div>
          </div>
        </div>
      </Button>
      {dropdown && (
        <>
          <div
            onClick={() => setDropdown(!dropdown)}
            className="fixed inset-0 bg-stone-900 opacity-25 z-20"
          ></div>
          <div className="absolute z-20 grid gap-3 text-stone-900 p-6 bg-white left-0 md:left-1/2 md:-translate-x-1/2 top-full md:rounded-md w-full md:mt-2 min-w-[250px]">
            {menuDashboard
              .filter((item) => !item.blocked)
              .map((item, key) => (
                <Link key={key} passHref href={`/dashboard/${item.endpoint}`}>
                  <div className="hover:text-yellow-500 ease">{item.title}</div>
                </Link>
              ))}
            <div>
              <hr className="my-2" />
            </div>
            <div
              onClick={() => UserLogout()}
              className="cursor-pointer hover:text-yellow-500 ease text-left"
            >
              Sair da conta
            </div>
          </div>
        </>
      )}
    </div>
  );
}
