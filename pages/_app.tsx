import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";

import "/public/scss/_shared.scss";
import "/styles/globals.css";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { AuthProvider } from "@/src/contexts/AuthContext";

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
    </SessionProvider>
  );
}
