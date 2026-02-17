/** @type {import('next').NextConfig} */

const cors = require("cors");

const nextConfig = {
  headers: () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value:
            "script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; font-src * data:; default-src *; ",
        },
      ],
    },
    {
      source: "/api/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "private, no-store, max-age=0, must-revalidate",
        },
        {
          key: "Access-Control-Allow-Origin",
          value: "*",
        },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
        },
        {
          key: "Access-Control-Allow-Headers",
          value:
            "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
        },
      ],
    },
    {
      source: "/admin/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "private, no-store, max-age=0, must-revalidate",
        },
      ],
    },
    {
      source: "/painel/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "private, no-store, max-age=0, must-revalidate",
        },
      ],
    },
    {
      source: "/dashboard/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "private, no-store, max-age=0, must-revalidate",
        },
      ],
    },
    {
      source: "/acesso/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "private, no-store, max-age=0, must-revalidate",
        },
      ],
    },
    {
      source: "/checkout/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "private, no-store, max-age=0, must-revalidate",
        },
      ],
    },
    {
      source: "/carrinho/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "private, no-store, max-age=0, must-revalidate",
        },
      ],
    },
  ],
  async rewrites() {
    return [
      {
        source: "/categoria/:slug",
        destination: "/categoria/:slug/pagina/1",
      },
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap",
      },
      // SEO: /produtos/loja/produto-123 -> /produtos/produto-123
      {
        source: "/produtos/:storeSlug/:productSlugId",
        destination: "/produtos/:productSlugId",
      },
    ];
  },
  generateEtags: true,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    APP_URL: process.env.APP_URL,
    API_REST: process.env.API_REST,
    BASE_URL: process.env.BASE_URL,
    GOOGLE_ID: process.env.GOOGLE_ID,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    TOKEN: process.env.TOKEN,
    PAGARME_API: process.env.PAGARME_API,
    PAGARME_ID: process.env.PAGARME_ID,
    PAGARME_PUBLIC_KEY: process.env.PAGARME_PUBLIC_KEY,
    PAGARME_SECRET_KEY: process.env.PAGARME_SECRET_KEY,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
  },
  trailingSlash: true,
  experimental: {
    scrollRestoration: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.fiestou.com.br",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "testeapi.fiestou.com.br",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "148.113.189.30",
        port: "8080",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
