import Api, { api } from "@/src/services/api";
import Router from "next/router";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { clearCartCookies } from "@/src/services/cart";

export async function getServerSideProps(ctx: any) {
  const response = new Api();

  let request: any = await response.bridge(
    {
      url: "logout",
    },
    ctx
  );

  return {
    props: {
      logout: true,
    },
  };
}

export default function Logout() {

  const handleLogout = async () => {
    clearCartCookies();
    Cookies.remove("fiestou.authtoken", { path: "/" });
    Cookies.remove("fiestou.user", { path: "/" });
    Cookies.remove("fiestou.store", { path: "/" });
    Cookies.remove("fiestou.region", { path: "/" });

    api.defaults.headers["Authorization"] = ``;

    await signOut({ redirect: false });

    window.location.href = "/";
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      handleLogout();
    }
  }, []);

  return <></>;
}
