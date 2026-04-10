import { createContext } from "react";
import Api, { api } from "@/src/services/api";
import Router from "next/router";
import Cookies from "js-cookie";
import { UserType } from "@/src/models/user";
import { isCEPInRegion } from "../helper";
import { clearCartCookies, getCartFromCookies } from "@/src/services/cart";
import {
  clearAuthCookies,
  readAuthToken,
  readStoreCookie,
  readUserCookie,
  setAuthTokenCookie,
  setRegionCookie,
  setStoreCookie,
  setUserCookie,
} from "@/src/services/authCookies";

// Helper para determinar tipo do usuário com fallback para campo person (legado)
export function getUserType(user: UserType | any): string {
  return user?.type || user?.person || "user";
}

type SignInData = {
  email: string;
  password: string;
  recaptcha_token?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  SignIn: (data: SignInData) => Promise<UserType | any>;
  UserLogout: Function;
};

export const AuthContext = createContext({} as AuthContextType);

export function getUser() {
  if (!!readAuthToken()) {
    const user = readUserCookie();
    if (user) {
      return user as UserType;
    }
  }

  return {} as UserType;
}

export function getStore() {
  if (!!readAuthToken()) {
    return readStoreCookie();
  }
}

export const AuthCheck = () => {
  if (!!window && false) {
    const api = new Api();

    const handleVisibilityChange = async (e: any) => {
      e.preventDefault();

      if (!document.hidden) {
        const data: any = await api.bridge({
          method: 'post',
          url: "me",
        });

        if (!data.id) {
          window.location.href = "/logout/";
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

  const isAuthenticated = !!readAuthToken();

  async function SignIn({ email, password, recaptcha_token }: SignInData) {
    clearAuthCookies();

    const data: any = await request.bridge({
      method: 'post',
      url: "auth/login",
      data: {
        email: email,
        password: password,
        recaptcha_token: recaptcha_token
      },
    });
    
    if (data && data.token) {
      const user: UserType = data.user;

      setAuthTokenCookie(data.token);
      setUserCookie(user);

      if (!!data?.store) {
        setStoreCookie(data.store);
      }

      if ((user?.address ?? []).some((item: any) => !!item.zipCode)) {
        for (const item of user.address?.filter(
          (item: any) => !!item.zipCode
        ) ?? []) {
          const handle: any = {
            cep: item.zipCode,
            validate: isCEPInRegion(item.zipCode),
          };

          setRegionCookie(handle);
          if (item.main) break;
        }
      }

      api.defaults.headers["Authorization"] = `Bearer ${data.token}`;

      if (Cookies.get("fiestou.redirect") == "checkout") {
        Cookies.remove("fiestou.redirect");
        Router.push("/checkout");
        return {} as UserType;
      }
      
      const userType = getUserType(user);
      if (userType === "master") {
        Router.push("/admin");
      } else if (userType === "partner") {
        Router.push("/painel");
      } else if (userType === "delivery") {
        Router.push("/entregador");
      } else if (getCartFromCookies().length === 0) {
        Router.push("/dashboard");
      } else {
        Router.push('/checkout')
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
  clearCartCookies({ syncApi: false, reason: "clear" });
  clearAuthCookies();

  // Redirecione para a página de logout ou home
    if (!!window) {
      window.location.href = "/logout/";
    } else {
      Router.push("/logout/");
    }
}
  return (
    <AuthContext.Provider value={{ isAuthenticated, SignIn, UserLogout }}>
      {children}
    </AuthContext.Provider>
  );
}
