import Api, { api } from "@/src/services/api";
import Router from "next/router";
import Cookies from "js-cookie";
import { useEffect } from "react";

export async function getServerSideProps(ctx: any) {
  const response = new Api();

  let request: any = await response.bridge(
    {
      url: "logout",
    },
    ctx
  );

  console.log(request, "<<");

  return {
    props: {
      logout: true,
    },
  };
}

export default function Logout() {
  const Logout = async () => {
    Cookies.remove("fiestou.authtoken");
    Cookies.remove("fiestou.user");
    Cookies.remove("fiestou.store");

    api.defaults.headers["Authorization"] = ``;

    Router.push("/acesso");

    return true;
  };

  useEffect(() => {
    if (!!window) {
      Logout();
    }
  }, []);

  return <></>;
}
