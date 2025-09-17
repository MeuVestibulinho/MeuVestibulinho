// src/app/admin/layout.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";

import AdminNavigation from "./AdminNavigation";

export const metadata: Metadata = {
  title: "Admin | MeuVestibulinho",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavigation />
      <section className="container mx-auto max-w-7xl px-4 pb-16 pt-24">{children}</section>
    </div>
  );
}
