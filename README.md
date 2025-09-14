# MeuVestibulinho
Meu Vestibulinho é uma plataforma que prepara alunos do 9º ano para vestibulinhos de ETEC, IF e escolas técnicas. Oferece conteúdos direcionados, simulados e dicas práticas para tornar o estudo acessível, organizado e aumentar as chances de aprovação.

# MeuVestibulinho — Setup Rápido

> **Stack:** Next.js 15 (App Router) • TypeScript • Auth.js v5 (JWT) • Prisma • Postgres (Docker) • Keycloak (dev)  
> **Rotas protegidas** por `middleware.ts` (libera: `/`, `/auth/signin`, `/api/*`, `/_next/*` e estáticos).  
> **Login custom:** `/auth/signin`. **Header** mostra nome do usuário e botão **Sair**.

---

## 1) Requisitos
- Node.js 18+ (recomendado 20+), npm
- Docker + Docker Compose
- Git

---

## 2) Clonar & instalar
    git clone <seu-repo>
    cd <pasta-do-projeto>
    npm install

---

## 3) `.env` (exemplo mínimo)
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=<um-segredo-forte>

    # Postgres (host usa 5433)
    DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/meuvestibulinho?schema=public
    SHADOW_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5433/postgres?schema=shadow

    # Keycloak (opcional em dev)
    KEYCLOAK_ISSUER=http://localhost:8080/realms/meuvestibulinho
    KEYCLOAK_CLIENT_ID=nextjs
    KEYCLOAK_CLIENT_SECRET=<cole-aqui>

    # (opcionais)
    AUTH_DISCORD_ID=
    AUTH_DISCORD_SECRET=
    AUTH_GOOGLE_ID=
    AUTH_GOOGLE_SECRET=

---

## 4) Subir infra (DB/Keycloak)
    docker compose up -d --remove-orphans
- Postgres container: 5432 (host: **5433**)  
- Keycloak: `http://localhost:8080`

---

## 5) Prisma
    npx prisma generate
    npx prisma migrate dev -n init   # ou: npx prisma db push
    npx prisma studio                # http://localhost:5555

> Com `session.strategy="jwt"`, o modelo `Session` não é usado (você verá `User` e `Account`).

---

## 6) Rodar o app
    npm run dev
    # http://localhost:3000

---

## 7) Login / Logout / Sessão
- Login custom: `http://localhost:3000/auth/signin`  
  - OAuth/OIDC (Keycloak/Google/Discord): botão `signIn(providerId)`  
  - Credentials (apenas dev): form com `<input name="email">`
- Logout: `http://localhost:3000/api/auth/signout` (confirmação)
- Sessão atual: `http://localhost:3000/api/auth/session`

---

## 8) Estrutura (essencial)
    src/
      app/
        layout.tsx
        page.tsx
        auth/
          signin/
            page.tsx          # página de login (Next 15: searchParams é Promise → use await)
      components/
        header/
          Header.tsx          # server: pega sessão e renderiza Entrar/Sair
        Navbar.tsx            # client: UI/hover/animações
      server/
        auth/
          config.ts           # Auth.js config + enabledProviders
          index.ts            # NextAuth factory (auth/handlers/signIn/signOut)
    middleware.ts             # libera rotas públicas e protege o resto
    prisma/
      schema.prisma

---

## 9) Dicas / Erros comuns
- **404 em `/auth/signin`** → arquivo em `src/app/auth/signin/page.tsx`.  
- **Login não abre** → `middleware.ts` precisa liberar `/auth/signin`.  
- **Next 15** → `searchParams` é **Promise** (`const { callbackUrl="/" } = await searchParams`).  
- **CredentialsSignin** → enviar `email` no form do provider `credentials`.  
- **Hydration (1.250 vs 1250)** → formate números com `Intl.NumberFormat("pt-BR")` em server e client.  
- **Turbopack root warning** → defina `experimental.turbo.root = process.cwd()` no `next.config.ts`.

---
