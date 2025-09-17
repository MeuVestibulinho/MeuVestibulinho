"use client";

import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ADMIN_VIEW_LABEL, ADMIN_VIEWS, type AdminView } from "./views";

const NAV_ITEMS = ADMIN_VIEWS.map((view) => ({
  view,
  label: ADMIN_VIEW_LABEL[view],
}));

export default function AdminNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const paramView = searchParams?.get("view");
  const currentView: AdminView =
    pathname && pathname.startsWith("/admin") && paramView === "questoes"
      ? "questoes"
      : "overview";

  const handleNavigate = (view: AdminView) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (view === "overview") {
      params.delete("view");
    } else {
      params.set("view", view);
    }

    const queryString = params.toString();
    const target = queryString ? `/admin?${queryString}` : "/admin";
    router.replace(target, { scroll: false });
  };

  return (
      <nav className="fixed top-16 left-0 right-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="container mx-auto flex max-w-7xl gap-2 px-4 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.view === currentView;
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => handleNavigate(item.view)}
              className={clsx(
                "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition",
                isActive
                  ? "bg-red-100 text-red-700 shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:text-red-600",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
