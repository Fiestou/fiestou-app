import { NextRequest, NextResponse } from "next/server";

// Helper para determinar tipo do usuário com fallback para campo person (legado)
function getUserType(user: any): string {
  return user?.type || user?.person || "user";
}

function isRoute(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function parseCookieUser(raw: string | undefined): any {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const permanentLink = req.nextUrl.clone();
  const token = req.cookies.get("fiestou.authtoken");

  const isDashboardPath = isRoute(pathname, "/dashboard");
  const isPainelPath = isRoute(pathname, "/painel");
  const isAdminPath = isRoute(pathname, "/admin");
  const isAcessoPath = isRoute(pathname, "/acesso");
  const isDashboardPedidosPath = isRoute(pathname, "/dashboard/pedidos");

  if (!token) {
    if (isDashboardPath || isPainelPath) {
      permanentLink.pathname = "/acesso";
      return NextResponse.redirect(permanentLink);
    }

    if (isAdminPath) {
      permanentLink.pathname = "/acesso/restrito";
      return NextResponse.redirect(permanentLink);
    }
  }

  if (token) {
    const user = parseCookieUser(req.cookies.get("fiestou.user")?.value);
    const userType = getUserType(user);

    if (!user?.status && isDashboardPath) {
      permanentLink.pathname = "/cadastre-se/completar";
      return NextResponse.redirect(permanentLink);
    }

    // Redireciona usuários logados que acessam /acesso para seu painel apropriado
    if (isAcessoPath) {
      if (userType === "master") {
        permanentLink.pathname = "/admin";
      } else if (userType === "partner") {
        permanentLink.pathname = "/painel";
      } else if (userType === "delivery") {
        permanentLink.pathname = "/entregador";
      } else {
        permanentLink.pathname = "/dashboard";
      }
      return NextResponse.redirect(permanentLink);
    }

    // Partner não pode acessar dashboard (exceto pedidos) nem admin
    if (
      userType === "partner" &&
      (isDashboardPath || isAdminPath) &&
      !isDashboardPedidosPath
    ) {
      permanentLink.pathname = "/painel";
      return NextResponse.redirect(permanentLink);
    }

    // Client não pode acessar painel nem admin
    if (userType === "client" && (isPainelPath || isAdminPath)) {
      permanentLink.pathname = "/dashboard";
      return NextResponse.redirect(permanentLink);
    }

    // Master não pode acessar dashboard nem painel
    if (userType === "master" && (isDashboardPath || isPainelPath)) {
      permanentLink.pathname = "/admin";
      return NextResponse.redirect(permanentLink);
    }
  }

  return NextResponse.next();
}
