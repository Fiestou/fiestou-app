import type { AppProps, NextWebVitalsMetric } from "next/app";
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
    const handleRouteChange = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
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

export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    label: metric.label,
    page: window.location.pathname,
    href: window.location.href,
    ts: Date.now(),
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/telemetry/web-vitals", payload);
    return;
  }

  fetch("/api/telemetry/web-vitals", {
    method: "POST",
    body: payload,
    headers: {
      "content-type": "application/json",
    },
    keepalive: true,
  }).catch(() => {});
}
