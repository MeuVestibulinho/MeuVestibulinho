// app/login/page.tsx
import { redirect } from "next/navigation";
import { auth } from "~/server/auth"; // mesmo import que você já usa em page.tsx

type Props = { searchParams?: { callbackUrl?: string; error?: string } };

export default async function LoginPage({ searchParams }: Props) {
  // garante que a página de login não renderize para quem já está logado
  const session = await auth().catch(() => null);
  const callbackUrl = searchParams?.callbackUrl || "/";
  if (session) redirect(callbackUrl);

  const err = searchParams?.error;

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 overflow-hidden">
      {/* blobs de fundo suaves, no mesmo clima da home */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-red-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
      </div>

      {/* mesmo espaçamento vertical da home para ficar abaixo da navbar fixa */}
      <div className="container mx-auto px-4 pt-36 md:pt-44 xl:pt-52 pb-32 relative z-10">
        <div className="mx-auto max-w-md">
          <div className="rounded-3xl shadow-2xl bg-white p-8">
            <h1 className="text-3xl font-bold text-gray-900">Entrar</h1>
            <p className="mt-2 text-gray-600">
              Acesse com sua conta do Keycloak para continuar.
            </p>

            {err ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                Falha ao autenticar: <span className="font-mono">{err}</span>
              </div>
            ) : null}

            <div className="mt-6">
              {/* Link direto para o fluxo do Auth.js (provider=keycloak) */}
              <a
                href={`/api/auth/signin?provider=keycloak&callbackUrl=${encodeURIComponent(
                  callbackUrl,
                )}`}
                className="inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 font-medium text-white transition
                           bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 active:scale-[0.99] shadow-lg"
              >
                Sign in with Keycloak
              </a>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Ao continuar, você concorda com nossos termos de uso e política de privacidade.
            </p>
          </div>

          <p className="mt-3 text-center text-xs text-slate-500">
            Precisa de ajuda? Fale com um administrador.
          </p>
        </div>
      </div>
    </main>
  );
}
