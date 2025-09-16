// src/components/header/Header.tsx
import Link from "next/link";
import { auth, signOut } from "~/server/auth";
import NavbarClient, { type NavLink } from "../Navbar";
import { LogIn, LogOut } from "lucide-react";

const BASE_LINKS: NavLink[] = [
  { name: "Simulados", href: "/simulados", icon: "BookOpen" },
  { name: "Meu Espaço", href: "", icon: "Paperclip" },
  { name: "Guia de Estudos", href: "/guia", icon: "GraduationCap" },
  { name: "Mini Cursos", href: "/mini-cursos", icon: "Play" },
];

function initials(label?: string): string {
  const base = label?.trim() ?? "";
  if (!base) return "U";

  // se vier email, usa tudo antes do @
  const at = base.indexOf("@");
  const clean = at >= 0 ? base.slice(0, at) : base;

  // tenta duas iniciais (ex.: “João Silva” -> “JS”)
  const parts = clean.split(/\s+/).filter(Boolean);
  const pick = (s?: string) => (s?.charAt(0)?.toUpperCase() ?? "");
  if (parts.length >= 2) return pick(parts[0]) + pick(parts[1]);

  // fallback: primeira letra do nome limpo
  return pick(parts[0] ?? clean);
}

function Avatar({ label }: { label: string }) {
  return (
    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-red-200">
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 text-xs font-semibold text-white">
        {initials(label)}
      </div>
    </div>
  );
}

export default async function Header() {
  const session = await auth();
  const user = session?.user;
  const role = (user as { role?: string } | undefined)?.role;
  const userLabel = user?.name ?? user?.email ?? "Usuário";

  const links: NavLink[] = [
    ...BASE_LINKS,
    ...(role === "ADMIN"
      ? [{ name: "Admin", href: "/admin/questoes", icon: "BookOpen" as const }]
      : []),
  ];

  const RightSlot = (
    <>
      {!user ? (
        <Link
          href="/api/auth/signin?callbackUrl=/admin/questoes"
          prefetch={false}
          aria-label="Entrar"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-4 py-2 font-medium text-gray-700 outline-none transition-all duration-300 hover:text-red-600 focus:ring-2 focus:ring-red-300"
        >
          <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-red-100/0 via-orange-100/0 to-red-100/0 transition-all duration-500 group-hover:from-red-100/60 group-hover:via-orange-100/60 group-hover:to-red-100/60" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300 group-hover:w-full" />
          <LogIn className="h-4 w-4 transition-colors duration-300 group-hover:text-red-600" />
          <span className="relative z-10">Entrar</span>
        </Link>
      ) : (
        <div className="flex items-center gap-3">
          <div className="group hidden items-center gap-2 rounded-full border border-gray-200/70 bg-white/80 px-2 py-1 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:flex">
            <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-red-100/0 via-orange-100/0 to-red-100/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <Avatar label={userLabel} />
            <span className="relative z-10 max-w-[16ch] truncate text-sm text-gray-800">
              {userLabel}
            </span>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              aria-label="Sair"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-red-300 bg-white/90 px-3 py-1.5 text-sm font-medium text-red-700 outline-none transition-all duration-300 hover:text-red-700 focus:ring-2 focus:ring-red-300"
            >
              <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-red-100/0 via-orange-100/0 to-red-100/0 transition-all duration-500 group-hover:from-red-100/60 group-hover:via-orange-100/60 group-hover:to-red-100/60" />
              <span className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300 group-hover:w-full" />
              <LogOut className="h-4 w-4 transition-colors duration-300 group-hover:text-red-700" />
              <span className="relative z-10">Sair</span>
            </button>
          </form>
        </div>
      )}
    </>
  );

  return (
    <NavbarClient
      links={links}
      isAuthenticated={Boolean(user)}
      userLabel={userLabel}
      signInHref="/api/auth/signin?callbackUrl=/admin/questoes"
      signOutHref="/api/auth/signout"
      rightSlot={RightSlot}
    />
  );
}
