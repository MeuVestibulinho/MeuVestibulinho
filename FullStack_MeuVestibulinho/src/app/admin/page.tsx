import { redirect } from "next/navigation";
import type { Session } from "next-auth";

import AdminDashboardClient from "./AdminDashboardClient";
import { auth, swallowSessionTokenError } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let session: Session | null = null;

  try {
    session = await auth();
  } catch (error) {
    if (!swallowSessionTokenError(error)) {
      throw error;
    }
  }

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/admin");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const overview = await api.admin.overview();

  return (
    <HydrateClient>
      <AdminDashboardClient currentUserId={session.user.id} initialOverview={overview} />
    </HydrateClient>
  );
}
