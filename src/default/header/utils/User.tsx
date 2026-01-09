import Icon from "@/src/icons/fontAwesome/FIcon";
import { getFirstName } from "@/src/helper";
import { useContext, useState } from "react";
import { Button } from "@/src/components/ui/form";
import { UserType } from "@/src/models/user";
import { AuthContext, getUserType } from "@/src/contexts/AuthContext";

export default function User({ user }: { user: UserType }) {
  const { UserLogout } = useContext(AuthContext);
  const [dropdown, setDropdown] = useState<boolean>(false);
  const userType = getUserType(user);

  return (
    <div className="md:relative">
      <Button
        style="btn-transparent"
        href={userType === "client" ? "/dashboard" : "/acesso"}
        onClick={() => (userType === "client" ? setDropdown(true) : {})}
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
            </div>
          </div>
        </div>
      </Button>
    </div>
  );
}