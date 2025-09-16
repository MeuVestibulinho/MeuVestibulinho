// src/app/admin/layout.tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | MeuVestibulinho",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <section className="container mx-auto px-4 py-8">
      {children}
    </section>
  );
}
