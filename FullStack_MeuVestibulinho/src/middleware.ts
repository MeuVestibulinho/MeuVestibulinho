import { auth } from "~/server/auth";

// Regex para liberar arquivos estáticos do public/ (ex.: .png, .svg, .ico)
const PUBLIC_FILE = /\.(.*)$/;

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Rotas liberadas sem login
  const allowed =
    pathname === "/" || // Home
    pathname === "/auth/signin" || // Página custom de login
    pathname.startsWith("/api/") || // APIs (inclui /api/auth)
    pathname.startsWith("/_next/") || // assets do Next.js
    PUBLIC_FILE.test(pathname); // arquivos estáticos

  if (allowed) return;

  // Se não autenticado → redireciona para /auth/signin preservando callbackUrl
  if (!req.auth) {
    const signInUrl = new URL("/auth/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return Response.redirect(signInUrl);
  }
});

// Matcher define em quais rotas o middleware roda
export const config = {
  matcher: ["/((?!_next/image|_next/static|favicon.ico).*)"],
};
