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
          <Link passHref href="/painel">
          <div className="hidden md:block w-fit text-sm lg:text-[1rem] whitespace-nowrap font-semibold font-title">
            <div className="whitespace-nowrap">
              Olá, {getFirstName(user.name)}
            </div>
            <div className="whitespace-nowrap">
              <span>Meu painel</span>
            </div>
          </div>
          </Link>
        </div>
      </Button>
    </div>
  );
}
