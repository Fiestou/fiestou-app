import type { AppProps } from "next/app";

import "/public/scss/_shared.scss";
import "/styles/globals.css";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { AuthProvider } from "@/src/contexts/AuthContext";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    if (!!document) {
      // Adicione as configurações de CSP aqui
      const cspHeader = `
        default-src * 'unsafe-inline';
        script-src * 'unsafe-inline' 'unsafe-eval';
        style-src * 'unsafe-inline';
        font-src 'self' https://fonts.gstatic.com data:;
      `;

      const metaTag = document.createElement("meta");
      metaTag.httpEquiv = "Content-Security-Policy";
      metaTag.content = cspHeader;
      document.head.appendChild(metaTag);
    }
  }, []);

  useEffect(() => {
    router.events.on("routeChangeComplete", () =>
      window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    );
  }, [router]);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
