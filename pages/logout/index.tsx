import Api, { api } from "@/src/services/api";
import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { clearCartCookies } from "@/src/services/cart";
import { clearAuthCookies } from "@/src/services/authCookies";

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
    clearCartCookies({ syncApi: false, reason: "clear" });
    clearAuthCookies();

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
