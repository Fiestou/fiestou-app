import { AuthContext } from "@/src/contexts/AuthContext";
import Api, { api } from "@/src/services/api";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { getSession } from "next-auth/react";
import { useContext, useEffect } from "react";
import Cookies from "js-cookie";
import { UserType } from "@/src/models/user";

export async function getServerSideProps(ctx: any) {
  const { res }: any = ctx;

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
      requestType: "post",
      url: "auth/external-auth",
      data: { email: user.email, name: user.name },
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
  const expires = { expires: 14 };

  Cookies.remove("fiestou.authtoken");
  Cookies.remove("fiestou.user");

  const setAuth = async () => {
    if (!!auth.token) {
      const user: UserType = auth.user;

      Cookies.set("fiestou.authtoken", auth.token, expires);
      Cookies.set("fiestou.user", JSON.stringify(user), expires);

      if (!!auth.store) Cookies.set("fiestou.store", auth.store, expires);

      api.defaults.headers["Authorization"] = `Bearer ${auth.token}`;

      if (!auth.user.status) {
        window.location.href = "/cadastre-se/completar";
      } else {
        window.location.href = "/painel";
      }
    } else {
      window.location.href = "/acesso";
    }
  };

  useEffect(() => {
    if (!!window) {
      setAuth();
    }
  }, []);

  return (
    <>
      <div className="py-10 text-center text-xl text-yellow-500">
        <Icon icon="fa-spinner-third" className="animate-spin" />
      </div>
    </>
  );
}
