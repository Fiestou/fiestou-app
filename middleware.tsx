import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: any) {
  let url = req.url;
  let permanentLink = req.nextUrl.clone();

  let token = req.cookies.get("fiestou.authtoken");

  if (!token) {
    if (url.includes("/dashboard") || url.includes("/painel/")) {
      permanentLink.pathname = "/acesso";
      return NextResponse.redirect(permanentLink);
    }

    if (url.includes("/admin")) {
      permanentLink.pathname = "/acesso/restrito";
      return NextResponse.redirect(permanentLink);
    }
  }

  if (!!token) {
    let user = JSON.parse(req.cookies.get("fiestou.user")?.value ?? "[]");

    if (!user.status && url.includes("/dashboard")) {
      permanentLink.pathname = "/cadastre-se/completar";
      return NextResponse.redirect(permanentLink);
    }

    // Redireciona usuários logados que acessam /acesso para seu painel apropriado
    if (url.includes("/acesso")) {
      if (user.type === "master") {
        permanentLink.pathname = "/admin";
      } else if (user.type === "partner") {
        permanentLink.pathname = "/painel";
      } else if (user.type === "delivery") {
        permanentLink.pathname = "/entregador";
      } else {
        permanentLink.pathname = "/dashboard";
      }
      return NextResponse.redirect(permanentLink);
    }

    // Partner não pode acessar dashboard (exceto pedidos) nem admin
    if (
      user.type === "partner" &&
      (url.includes("/dashboard") || url.includes("/admin")) &&
      !url.includes("/dashboard/pedidos")
    ) {
      permanentLink.pathname = "/painel";
      return NextResponse.redirect(permanentLink);
    }

    // Client não pode acessar painel nem admin
    if (
      user.type === "client" &&
      (url.includes("/painel/") || url.includes("/admin"))
    ) {
      permanentLink.pathname = "/dashboard";
      return NextResponse.redirect(permanentLink);
    }

    // Master não pode acessar dashboard nem painel
    if (
      user.type === "master" &&
      (url.includes("/dashboard") || url.includes("/painel/"))
    ) {
      permanentLink.pathname = "/admin";
      return NextResponse.redirect(permanentLink);
    }

  }

  return NextResponse.next();
}
