/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.APP_URL || "https://www.fiestou.com.br",
  changefreq: "daily",
  generateRobotsTxt: true,
  exclude: [
    "/admin/",
    "/admin/*",
    "/dashboard/",
    "/dashboard/*",
    "/painel/",
    "/painel/*",
    "/api/",
    "/api/*",
    "/checkout",
    "/finalizar",
    "/carrinho",
    "/login",
    "/logout",
  ],
};
