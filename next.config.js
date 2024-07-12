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
      source: "/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "no-store",
        },
      ],
    },
    {
      source: "/api/:path*",
      headers: [
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
  ],
  generateEtags: false,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    APP_URL: process.env.APP_URL,
    API_REST: process.env.API_REST,
    BASE_URL: process.env.BASE_URL,
    GOOGLE_ID: process.env.GOOGLE_ID,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,
    TOKEN: process.env.TOKEN,
    PAGARME_API: process.env.PAGARME_API,
    PAGARME_ID: process.env.PAGARME_ID,
    PAGARME_PUBLIC_KEY: process.env.PAGARME_PUBLIC_KEY,
    PAGARME_SECRET_KEY: process.env.PAGARME_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    MAIL_MAILER: process.env.MAIL_MAILER,
    MAIL_HOST: process.env.MAIL_HOST,
    MAIL_PORT: process.env.MAIL_PORT,
    MAIL_ENCRYPTION: process.env.MAIL_ENCRYPTION,
    MAIL_USERNAME: process.env.MAIL_USERNAME,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD,
  },
  async rewrites() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/api/sitemap",
      },
    ];
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
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
