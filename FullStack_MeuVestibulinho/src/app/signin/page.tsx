import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { signIn, providerMap } from "~/server/auth";
import { AuthError } from "next-auth";
import { Button } from "~/app/_components/button";
import { SiGoogle, SiDiscord, SiKeycloak } from "react-icons/si";

const SIGNIN_ERROR_URL = "/error";

const providerIcons: Record<string, ReactElement> = {
  google: <SiGoogle className="h-6 w-6" />,
  discord: <SiDiscord className="h-6 w-6" />,
  keycloak: <SiKeycloak className="h-6 w-6" />,
};

export default async function SignInPage(props: {
  searchParams: { callbackUrl?: string };
}) {
  const providers = providerMap;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-orange-100 to-yellow-100 px-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white/80 backdrop-blur-md shadow-2xl p-10 space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Bem-vindo de volta</h1>
          <p className="text-sm text-gray-700">
            Entre com o provedor de sua escolha para continuar
          </p>
        </header>

        <div className="flex flex-col gap-4">
          {providers.map((provider) => (
            <form
              key={provider.id}
              className="w-full flex justify-center" // centraliza o botão dentro do card
              action={async () => {
                "use server";
                try {
                  await signIn(provider.id, {
                    redirectTo: props.searchParams?.callbackUrl ?? "",
                  });
                } catch (err) {
                  if (err instanceof AuthError) {
                    redirect(`${SIGNIN_ERROR_URL}?error=${err.type}`);
                  }
                  throw err;
                }
              }}
            >
              <Button
                type="submit"
                variant="primary"
                className="flex items-center gap-3 px-6 py-3 text-sm font-medium hover:scale-105 transition-transform"
              >
                <span className="flex-shrink-0">{providerIcons[provider.id] ?? null}</span>
                <span>Entrar com {provider.name}</span>
              </Button>
            </form>
          ))}
        </div>

        <div className="text-center text-gray-500 text-xs mt-6">
          Ao continuar, você concorda com nossos termos de serviço e política de privacidade.
        </div>
      </div>
    </main>
  );
}
