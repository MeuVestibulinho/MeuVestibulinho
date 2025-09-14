// src/app/auth/signin/page.tsx
import Link from "next/link";
import { enabledProviders } from "~/server/auth/config";
import { signIn } from "~/server/auth";
import { type ReactNode } from "react";
import {
  FaGoogle,
  FaDiscord,
  FaKey,
  FaEnvelope,
  FaShieldAlt,
  FaGraduationCap,
} from "react-icons/fa";

export const dynamic = "force-dynamic";

const PROVIDER_ICON: Record<string, ReactNode> = {
  keycloak: <FaKey className="h-5 w-5 text-red-600" />,
  google: <FaGoogle className="h-5 w-5 text-red-600" />,
  discord: <FaDiscord className="h-5 w-5 text-red-600" />,
  credentials: <FaEnvelope className="h-5 w-5 text-red-600" />,
};

export default async function SignInPage({
  searchParams,
}: {
  // 👇 Next 15: searchParams é Promise — precisamos dar await
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl = "/" } = await searchParams;

  return (
    <main className="relative mx-auto flex min-h-screen w-full items-center justify-center px-4 py-16">
      {/* background decor */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-red-500 blur-3xl" />
        <div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-orange-500 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg">
            <FaGraduationCap className="h-8 w-8" />
          </div>
          <div className="text-2xl font-bold">
            <span className="text-red-600">Meu</span>
            <span className="text-orange-500">Vestibulinho</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-red-100/60 bg-white/90 shadow-xl backdrop-blur-sm">
          <div className="border-b border-red-100/60 bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4">
            <h1 className="text-lg font-semibold text-gray-900">Entrar</h1>
            <p className="mt-1 text-sm text-gray-600">
              Escolha um provedor para acessar sua conta.
            </p>
          </div>

          <div className="space-y-3 p-6">
            {enabledProviders.length === 0 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                Nenhum provedor habilitado nas variáveis de ambiente.
              </div>
            )}

            {enabledProviders.map((p) => (
              <form
                key={p.id}
                action={async () => {
                  "use server";
                  await signIn(p.id, { redirectTo: callbackUrl });
                }}
              >
                <button
                  type="submit"
                  className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-left transition hover:border-red-300 hover:bg-red-50/40"
                >
                  <span className="flex h-6 w-6 items-center justify-center">
                    {PROVIDER_ICON[p.id] ?? (
                      <FaShieldAlt className="h-5 w-5 text-red-600" />
                    )}
                  </span>
                  <span className="font-medium text-gray-800 group-hover:text-red-700">
                    Entrar com {p.name}
                  </span>
                </button>
              </form>
            ))}

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
          <Link
            href="/"
            className="underline underline-offset-2 hover:text-red-600"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </main>
  );
}
