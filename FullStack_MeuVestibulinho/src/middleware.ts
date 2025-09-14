// middleware.ts
// Bloqueia TUDO que não seja "/" (home) para quem não está logado.
// Libera: home, /api/* (inclui /api/auth/*), /_next/* e arquivos estáticos do /public.

import { NextResponse } from "next/server";
import { auth } from "~/server/auth";

// regex de arquivos estáticos servidos a partir de /public
const STATIC_ASSET_REGEX =
  /\.(?:png|jpe?g|svg|webp|gif|ico|bmp|avif|css|js|mjs|map|txt|xml|json|pdf|woff2?|ttf|otf|eot|mp3|wav|mp4|webm)$/i;

const PUBLIC_EXACT = new Set<string>([
  "/", // home
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  // rotas de auth precisam ficar livres
  "/api/auth/signin",
  "/api/auth/signout",
  "/api/auth/callback/keycloak",
  "/api/auth/callback/discord",
  "/api/auth/callback/google",
]);

const PUBLIC_PREFIX = [
  "/api/",   // inclui /api/auth e /api/trpc
  "/_next/", // assets internos do Next (inclui next/image)
];

export default auth((req) => {
  const { pathname, search } = req.nextUrl;

  // 1) libera assets estáticos (do /public e cia)
  if (STATIC_ASSET_REGEX.test(pathname)) return NextResponse.next();

  // 2) libera caminhos públicos exatos
  if (PUBLIC_EXACT.has(pathname)) return NextResponse.next();

  // 3) libera prefixos públicos
  if (PUBLIC_PREFIX.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // 4) qualquer outra rota exige login
  if (!req.auth) {
    const signin = new URL("/api/auth/signin", req.url);
    signin.searchParams.set("callbackUrl", pathname + search || "/");
    return NextResponse.redirect(signin);
  }

  return NextResponse.next();
});

// Roda em tudo; a lógica acima decide o que é público
export const config = {
  matcher: ["/:path*"],
};
