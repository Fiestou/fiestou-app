import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import "/public/scss/_shared.scss";
import "/styles/globals.css";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter();

  useEffect(() => {
    router.events.on("routeChangeComplete", () =>
      window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    );
  }, [router]);

  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </SessionProvider>
  );
}
