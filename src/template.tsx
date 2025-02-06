import Image from "next/image";
import { Header, HeaderType } from "@/src/default/header";
import { Footer, FooterType } from "@/src/default/footer";
import Head from "next/head";
import { getImage } from "./helper";
import Lgpd from "./default/alerts/lgpd";
import { useEffect, useState } from "react";
import React from "react";
import Script from "next/script";

interface MetaType {
  title?: string;
  image?: string;
  description?: string;
  url?: string;
}

export default function Template({
  children,
  scripts,
  metaPage,
  header,
  footer,
}: {
  children: React.ReactNode;
  scripts?: any;
  metaPage?: MetaType;
  header?: HeaderType;
  footer?: FooterType;
}) {
  const meta = {
    title: metaPage?.title ?? "",
    image: metaPage?.image,
    description: metaPage?.description ?? "",
    url: `https://www.fiestou.com.br/${metaPage?.url}`,
  };

  const [renderLgpd, setRenderLgpd] = useState(false as boolean);

  useEffect(() => {
    if (!!window) {
      const hostname = window.location.href;

      setRenderLgpd(
        !(
          hostname.includes("vercel") ||
          hostname.includes("localhost-") ||
          hostname.includes("admin") ||
          hostname.includes("checkout") ||
          hostname.includes("carrinho")
        ) && !!scripts?.id
      );
    }
  }, []);

  return (
    <>
      <Head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta httpEquiv="Cache-Control" content="public, max-age=3600" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta httpEquiv="content-language" content="pt-BR" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="audience" content="all" />

        <title>{meta.title}</title>

        {!!header?.content?.header_icon &&
          !!getImage(header?.content?.header_icon) && (
            <>
              <link
                rel="shortcut icon"
                href={getImage(header?.content?.header_icon, "lg")}
              ></link>
            </>
          )}

        {!!header?.content?.header_shortcut &&
          !!getImage(header?.content?.header_shortcut) && (
            <>
              <link
                rel="icon"
                href={getImage(header?.content?.header_shortcut, "lg")}
                type="image/x-icon"
              />
              <link
                rel="apple-touch-icon"
                sizes="180x180"
                href={getImage(header?.content?.header_shortcut, "lg")}
              />
            </>
          )}

        <meta name="theme-color" content="#2798c6" />
        <meta name="msapplication-navbutton-color" content="#2798c6" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#2798c6" />
        <meta name="audience" content="all" />
        <meta name="MobileOptimized" content="320" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="referrer" content="no-referrer-when-downgrade" />

        <meta itemProp="name" content={meta.title} />
        <meta itemProp="url" content={meta.url} />
        <meta itemProp="description" content={meta.description} />
        <meta itemProp="image" content={meta.image} />

        <meta property="og:url" content={meta.url} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={meta.title} />
        <meta property="og:image" content={meta.image} />
        <meta property="og:image:secure_url" content={meta.image} />
        <meta property="og:image:alt" content="Thumbnail" />
        <meta property="og:image:type" content="image/png" />
      </Head>

      <Header {...header} />
      {children}
      <Footer {...footer} />

      <Lgpd content={scripts} status={renderLgpd} />
    </>
  );
}
