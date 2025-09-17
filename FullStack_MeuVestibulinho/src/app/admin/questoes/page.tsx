import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminQuestoesPage() {
  redirect("/admin?view=questoes");
}
