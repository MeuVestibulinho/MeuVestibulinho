// ex.: src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }

  return <div>Bem-vindo, {session.user?.name ?? "usuário"}!</div>;
}
