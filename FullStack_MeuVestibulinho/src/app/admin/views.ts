export const ADMIN_VIEWS = ["overview", "questoes", "mini-cursos"] as const;

export type AdminView = (typeof ADMIN_VIEWS)[number];

export const ADMIN_VIEW_LABEL: Record<AdminView, string> = {
  overview: "Painel geral",
  questoes: "Banco de questões",
  "mini-cursos": "Mini-cursos",
};
