import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getUser, getUserType } from "@/src/contexts/AuthContext";
import { UserType } from "@/src/models/user";
import Clean from "@/src/default/header/Clean";
import Default from "@/src/default/header/Default";
import Painel from "@/src/default/header/Painel";
import Admin from "@/src/default/header/Admin";

export interface HeaderType {
  template?: string | "";
  position?: string | "";
  background?: string | "";
  pathname?: string | "";
  scroll?: boolean | false;
  content?: any;
  backHistory?: string;
}

export function Header(props: HeaderType) {
  const pathname = usePathname() || "";

  const [user, setUser] = useState({} as UserType);

  const [params, setParams] = useState({
    template: "default",
    position: "fixed",
    pathname: pathname,
    background: "bg-cyan-500 ",
    scroll: false,
    ...props,
  });

  useEffect(() => {
    if (!!window) {
      setUser(getUser);

      window.addEventListener("scroll", function () {
        setParams({ ...params, scroll: window.scrollY > 0 });
      });
    }
  }, [params]);

  const userType = getUserType(user);

  if (params.template == "clean") {
    return <Clean params={params} user={user} />;
  }

  if (params.template == "default" || params.template == "dashboard") {
    return <Default params={params} user={user} />;
  }

  if (params.template == "painel" && userType === "partner") {
    return <Painel params={params} user={user} />;
  }

  if (params.template == "admin" && userType === "master") {
    return <Admin params={params} user={user} />;
  }

  return null;
}
