import { createContext } from "react";
import Api, { api } from "@/src/services/api";
import Router from "next/router";
import Cookies from "js-cookie";
import { UserType } from "@/src/models/user";
import { signOut } from "next-auth/react";
import { isCEPInRegion } from "../helper";

type SignInData = {
  email: string;
  password: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  SignIn: (data: SignInData) => Promise<UserType | any>;
  UserLogout: Function;
};

export const AuthContext = createContext({} as AuthContextType);

export function getUser() {
  if (!!Cookies.get("fiestou.authtoken")) {
    let cookie = Cookies.get("fiestou.user") ?? JSON.stringify([]);
    let user = JSON.parse(cookie);

    return user as UserType;
  }

  return {} as UserType;
}

export function getStore() {
  if (!!Cookies.get("fiestou.authtoken")) {
    return Cookies.get("fiestou.store");
  }
}

export const AuthCheck = () => {
  if (!!window && false) {
    const api = new Api();

    const handleVisibilityChange = async (e: any) => {
      e.preventDefault();

      if (!document.hidden) {
        const data: any = await api.bridge({
          url: "me",
        });

        if (!data.id) {
          window.location.href = "/logout";
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const request = new Api();

  const isAuthenticated = !!Cookies.get("fiestou.authtoken");

  async function SignIn({ email, password }: SignInData) {
    const expires = { expires: 14 };

    Cookies.remove("fiestou.authtoken");
    Cookies.remove("fiestou.user");

    const data: any = await request.bridge({
      url: "auth/login",
      data: { email: email, password: password },
    });
    
    if (!!data.token) {
      const user: UserType = data.user;

      Cookies.set("fiestou.authtoken", data.token, expires);
      Cookies.set("fiestou.user", JSON.stringify(user), expires);

      if (!!data?.store) Cookies.set("fiestou.store", data.store, expires);

      if ((user?.address ?? []).some((item: any) => !!item.zipCode)) {
        for (const item of user.address?.filter(
          (item: any) => !!item.zipCode
        ) ?? []) {
          const handle: any = {
            cep: item.zipCode,
            validate: isCEPInRegion(item.zipCode),
          };

          Cookies.set("fiestou.region", JSON.stringify(handle), expires);
          if (item.main) break;
        }
      }

      api.defaults.headers["Authorization"] = `Bearer ${data.token}`;

      if (Cookies.get("fiestou.redirect") == "checkout") {
        Cookies.remove("fiestou.redirect");
        Router.push("/checkout");
        return {} as UserType;
      }
      
      if (user?.person == "master") {
        Router.push("/admin");
      }else if (user?.person == "partner") {
        Router.push("/painel");
      }else if (user.person == "delivery") {
        Router.push("/delivery");
      } else {
        Router.push("/dashboard");
      }

      return {
        status: 200,
        user: user,
      };
    }

    return {
      status: 422,
      error: "Ops! Os dados de acesso não são válidos.",
    };
  }

  async function UserLogout() {
    const handleSignOut = await signOut({ redirect: false });

    if (!!window) {
      window.location.href = "/logout";
    } else {
      Router.push("/logout");
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, SignIn, UserLogout }}>
      {children}
    </AuthContext.Provider>
  );
}
