import { getUserType } from "@/src/contexts/AuthContext";
import Api, { api } from "@/src/services/api";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { getSession } from "next-auth/react";
import { useEffect } from "react";
import { UserType } from "@/src/models/user";
import {
  clearAuthCookies,
  setAuthTokenCookie,
  setStoreCookie,
  setUserCookie,
} from "@/src/services/authCookies";

export async function getServerSideProps(ctx: any) {
  const session: any = await getSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/acesso",
        permanent: false,
      },
    };
  }

  const user = session.user;

  const api = new Api();

  let auth: any = await api.bridge(
    {
      method: "post",
      url: "auth/external-auth",
      data: { email: user.email, name: user.name },
      opts: {
        headers: {
          "X-Fiestou-Auth-Bridge":
            process.env.INTERNAL_AUTH_BRIDGE_SECRET ?? process.env.TOKEN ?? "",
        },
      },
    },
    ctx
  );

  if (!auth.response) {
    return {
      redirect: {
        destination: "/acesso",
        permanent: false,
      },
    };
  }

  return {
    props: {
      auth: auth,
    },
  };
}

export default function Auth({ auth }: any) {
  clearAuthCookies();

  useEffect(() => {
    if (!!window) {
      if (!!auth.token) {
        const user: UserType = auth.user;

        setAuthTokenCookie(auth.token);
        setUserCookie(user);

        if (!!auth.store) {
          setStoreCookie(auth.store);
        }

        api.defaults.headers["Authorization"] = `Bearer ${auth.token}`;

        const userType = getUserType(user);
        if (!auth.user.status) {
          window.location.href = "/cadastre-se/completar";
        } else if (userType === "master") {
          window.location.href = "/admin";
        } else if (userType === "partner") {
          window.location.href = "/painel";
        } else if (userType === "delivery") {
          window.location.href = "/entregador";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        window.location.href = "/acesso";
      }
    }
  }, [auth]);

  return (
    <>
      <div className="py-10 text-center text-xl text-yellow-500">
        <Icon icon="fa-spinner-third" className="animate-spin" />
      </div>
    </>
  );
}
