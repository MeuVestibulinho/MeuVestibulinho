// src/app/auth/signin/page.tsx
import Link from "next/link";
import { enabledProviders } from "~/server/auth/config";
import { signIn } from "~/server/auth";
import { Shield, KeyRound, Mail, Globe, Gamepad2, GraduationCap } from "lucide-react";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

// mapeia ícones (genéricos) por provider id
const ICON: Record<string, ReactNode> = {
  keycloak: <KeyRound className="h-5 w-5 text-red-600" />,
  google: <Globe className="h-5 w-5 text-red-600" />,
  discord: <Gamepad2 className="h-5 w-5 text-red-600" />,
  credentials: <Mail className="h-5 w-5 text-red-600" />,
};

export default async function SignInPage({
  // Next.js 15: searchParams é Promise -> precisa de await
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl = "/" } = await searchParams;

  return (
    <main className="relative mx-auto flex min-h-screen w-full items-center justify-center px-4 py-16">
      {/* BG decorativo */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-red-500 blur-3xl" />
        <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-orange-500 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / título */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div className="text-2xl font-bold">
            <span className="text-red-600">Meu</span>
            <span className="text-orange-500">Vestibulinho</span>
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-red-100/60 bg-white/90 shadow-xl backdrop-blur-sm">
          <div className="border-b border-red-100/60 bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4">
            <h1 className="text-lg font-semibold text-gray-900">Entrar</h1>
            <p className="mt-1 text-sm text-gray-600">Escolha um provedor para acessar sua conta.</p>
          </div>

          <div className="space-y-3 p-6">
            {enabledProviders.length === 0 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                Nenhum provedor habilitado nas variáveis de ambiente.
              </div>
            )}

            {enabledProviders.map((p) =>
              p.id === "credentials" ? (
                // Credentials precisa enviar o campo "email"
                <form
                  key="credentials"
                  action={async (formData: FormData) => {
                    "use server";
                    const raw = formData.get("email"); // FormDataEntryValue | null
                    if (typeof raw !== "string") return; // evita File/null
                    const email = raw.trim();
                    if (!email) return;
                    await signIn("credentials", { email, redirectTo: callbackUrl });
                  }}
                  className="space-y-2 rounded-xl border border-gray-200 p-4"
                >
                  <label className="block text-sm font-medium text-gray-700">E-mail</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="voce@exemplo.com"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-200"
                  />
                  <button
                    type="submit"
                    className="group relative mt-2 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-gray-200 px-4 py-3 font-medium text-gray-800 transition hover:border-red-300 hover:bg-red-50/40"
                  >
                    <span className="flex h-6 w-6 items-center justify-center">{ICON.credentials}</span>
                    <span className="relative z-10">Entrar com e-mail</span>
                  </button>
                </form>
              ) : (
                // OAuth/OIDC: botão simples
                <form
                  key={p.id}
                  action={async () => {
                    "use server";
                    await signIn(p.id, { redirectTo: callbackUrl });
                  }}
                >
                  <button
                    type="submit"
                    className="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-gray-200 px-4 py-3 text-left transition hover:border-red-300 hover:bg-red-50/40"
                  >
                    <span className="flex h-6 w-6 items-center justify-center">
                      {ICON[p.id] ?? <Shield className="h-5 w-5 text-red-600" />}
                    </span>
                    <span className="font-medium text-gray-800 transition-colors group-hover:text-red-700">
                      Entrar com {p.name}
                    </span>
                    {/* underline animado no hover (consistente com navbar) */}
                    <span className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300 group-hover:w-full" />
                  </button>
                </form>
              ),
            )}

            <div className="pt-2 text-center text-xs text-gray-500">
              Ao continuar, você concorda com nossos{" "}
              <Link href="/termos" className="underline hover:text-red-600">
                Termos
              </Link>{" "}
              e{" "}
              <Link href="/privacidade" className="underline hover:text-red-600">
                Política de Privacidade
              </Link>
              .
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/" className="underline underline-offset-2 hover:text-red-600">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </main>
  );
}
