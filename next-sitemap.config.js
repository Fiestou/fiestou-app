/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.APP_URL || "https://www.fiestou.com.br",
  changefreq: "daily",
  generateRobotsTxt: true,
  exclude: [
    "/admin/*",
    "/dashboard/*",
    "/painel/*",
    "/api/*",
    "/checkout",
    "/finalizar",
    "/carrinho",
    "/login",
    "/logout",
  ],
};
