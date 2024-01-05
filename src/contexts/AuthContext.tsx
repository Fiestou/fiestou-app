import { createContext, useEffect } from "react";
import Api, { api } from "@/src/services/api";
import Router from "next/router";
import Cookies from "js-cookie";
import { UserType } from "@/src/models/user";

type SignInData = {
  email: string;
  password: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  SignIn: (data: SignInData) => Promise<UserType | any>;
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

export const AuthCheck = () => {
  if (!!window) {
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

      api.defaults.headers["Authorization"] = `Bearer ${data.token}`;

      if (Cookies.get("fiestou.redirect") == "checkout") {
        Cookies.remove("fiestou.redirect");
        Router.push("/checkout");
        return {} as UserType;
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, SignIn }}>
      {children}
    </AuthContext.Provider>
  );
}
