import { NextResponse } from "next/server";

import { uncachedAuth } from "./src/server/auth";

const PUBLIC_ROUTES = new Set([
  "/",
  "/sobre",
  "/privacidade",
  "/termos",
  "/contato",
  "/ajuda",
]);

const PUBLIC_PREFIXES = ["/auth", "/api/auth", "/public", "/images"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) {
    return true;
  }

  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

const middleware = uncachedAuth((req) => {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const session = req.auth;

  if (!session?.user) {
    const signInUrl = req.nextUrl.clone();
    signInUrl.pathname = "/api/auth/signin";
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  const role = (session.user as { role?: string } | undefined)?.role;
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
});

export default middleware;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|assets|.*\\.(png|jpg|jpeg|svg|gif)).*)"],
};
