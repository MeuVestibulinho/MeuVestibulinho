import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { Alternativa, Disciplina, GrauDificuldade } from "@prisma/client";

import AdminDashboardClient from "./AdminDashboardClient";
import { ADMIN_VIEWS, type AdminView } from "./views";
import { auth, swallowSessionTokenError } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export const dynamic = "force-dynamic";

type PageSearchParams = {
  view?: string;
};

function isAdminView(value: string | undefined): value is AdminView {
  return ADMIN_VIEWS.includes((value ?? "") as AdminView);
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: PageSearchParams;
}) {
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
  const viewParam = searchParams?.view;
  const activeView: AdminView = isAdminView(viewParam) ? (viewParam as AdminView) : "overview";
  const disciplinaOptions = Object.values(Disciplina);
  const grauOptions = Object.values(GrauDificuldade);
  const letraOptions = Object.values(Alternativa);

  return (
    <HydrateClient>
      <AdminDashboardClient
        currentUserId={session.user.id}
        initialOverview={overview}
        activeView={activeView}
        disciplinaOptions={disciplinaOptions}
        grauOptions={grauOptions}
        letraOptions={letraOptions}
      />
    </HydrateClient>
  );
}
