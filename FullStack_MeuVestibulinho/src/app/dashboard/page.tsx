// ex.: src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth, swallowSessionTokenError } from "~/server/auth";

export default async function DashboardPage() {
  let session: Session | null = null;

  try {
    session = await auth();
  } catch (error) {
    if (!swallowSessionTokenError(error)) {
      throw error;
    }
  }

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }

  return <div>Bem-vindo, {session.user?.name ?? "usuário"}!</div>;
}
