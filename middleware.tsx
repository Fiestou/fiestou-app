import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: any) {
  let url = req.url;
  let permanentLink = req.nextUrl.clone();

  let token = req.cookies.get("fiestou.authtoken");

  if (!token) {
    if (url.includes("/dashboard") || url.includes("/painel")) {
      permanentLink.pathname = "/acesso";
      return NextResponse.redirect(permanentLink);
    }

    if (url.includes("/admin")) {
      permanentLink.pathname = "/login/restrito";
      return NextResponse.redirect(permanentLink);
    }
  }

  if (!!token) {
    let user = JSON.parse(req.cookies.get("fiestou.user")?.value ?? "[]");

    if (url.includes("/login")) {
      permanentLink.pathname = "/admin";
      return NextResponse.redirect(permanentLink);
    }

    if (url.includes("/acesso")) {
      permanentLink.pathname =
        user.person == "client" ? "/dashboard" : "/painel";
      return NextResponse.redirect(permanentLink);
    }

    if (
      user.person == "partner" &&
      (url.includes("/dashboard") || url.includes("/admin"))
    ) {
      permanentLink.pathname = "/painel";
      return NextResponse.redirect(permanentLink);
    }

    if (
      user.person == "client" &&
      (url.includes("/painel/") || url.includes("/admin"))
    ) {
      permanentLink.pathname = "/dashboard";
      return NextResponse.redirect(permanentLink);
    }

    if (
      user.person == "master" &&
      (url.includes("/dashboard") || url.includes("/painel/"))
    ) {
      permanentLink.pathname = "/admin";
      return NextResponse.redirect(permanentLink);
    }

    // // console.log(token, user);
  }

  return NextResponse.next();
}
