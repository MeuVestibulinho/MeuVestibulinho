# MeuVestibulinho
Meu Vestibulinho é uma plataforma que prepara alunos do 9º ano para vestibulinhos de ETEC, IF e escolas técnicas. Oferece conteúdos direcionados, simulados e dicas práticas para tornar o estudo acessível, organizado e aumentar as chances de aprovação.


## Como configurar o ambiente de desenvolvimento
Copie o .env.example para .env e configure.
Rode o docker compose na pasta:
```sh
cd .. && docker-compose up -d
```

Faça a migração do prisma:
```sh
npx prisma db push
```

Configure o keycloak para podermos fazer usuários de teste:
- Acesse http://localhost:8080
- Clique em "Manage Realms"
- Clique no realm "meuvestibulinho"
- Crie um novo usuário acessando "Manage > Users"
- Escolha o username, email e nome.
- Na página "User details" vá em "Credentials" e coloque uma nova senha
- Lembre-se de desmarcar a opção "Temporary"


## Observações Importantes sobre Configuração de Rotas no T3 (Next.js App Router)

No **T3 Stack** (que usa Next.js com o **App Router**), o sistema de rotas funciona de forma **automática**, baseado na **estrutura de pastas** dentro da pasta `app`.  

###  Regras principais
- Cada **rota** deve ser representada por uma **pasta** dentro de `app/`.  
- Dentro dessa pasta, o arquivo **obrigatório** para renderizar a página é o **`page.tsx`**.  
- O nome da pasta define o caminho da URL.  
- O arquivo precisa exportar **um componente default**.

---

### Estrutura de exemplo

```bash
src/
 └─ app/
     ├─ layout.tsx         # Layout global (Navbar, Footer, etc.)
     ├─ page.tsx           # Página inicial (rota "/")
     └─ guia/
         └─ page.tsx       # Página "Guia" (rota "/guia")


# Banco de Dados (SQLite) — Setup rápido

## 1) Pré-requisitos
- Node.js 18+ (projeto em ESM)
- NPM (ou Yarn/PNPM)
- Dependências instaladas:
npm install

## 2) Variáveis de ambiente
Crie um `.env` na raiz:
DATABASE_URL="file:./dev.db"

## 3) Configurar seed (ESM)
No `package.json`, garanta:
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
Se precisar instalar:
npm i -D tsx

## 4) Sincronizar schema e gerar Prisma Client
> **Windows/PowerShell:** rode **um comando por vez** (sem `&&`).
npx prisma generate
npx prisma db push

- `db push` cria/sincroniza `dev.db` (SQLite) com o `schema.prisma`.
- `generate` atualiza o Prisma Client.

## 5) Rodar os seeds
Executa `seed.base.ts` (tópicos, subtopics, tags, provas) e `seed.demo.ts` (uma questão demo):
npx prisma db seed

Saída esperada:
✅ seed.base: tópicos/subtópicos/tags/sourceExam criados/atualizados  
✅ seed.demo: questão de exemplo criada/atualizada <id>  
✅ Seed concluído: base + demo

## 6) Conferir no Prisma Studio (opcional)
npx prisma studio

Abra `http://localhost:5555` e confira:
- **Topic** (ex.: “Matemática”)
- **Subtopic** (ex.: “Frações”)
- **Tag** (ex.: “Frações”)
- **SourceExam** (ex.: “ETEC 2023”)
- **Question** (questão demo vinculada)

---

## Troubleshooting
- **`npm prisma ...` não funciona:** use `npx prisma ...`.
- **PowerShell não aceita `&&`:** rode cada comando separadamente.
- **Erro de import no seed:** confirme `"type": "module"` no `package.json` e a chave `"prisma": { "seed": "tsx prisma/seed.ts" }`.
- **Models não encontrados no seed:** rode `npx prisma generate` após mudanças no `schema.prisma`.

---

## Scripts úteis (opcional)
Adicionar ao `package.json`:
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}

Uso:
npm run db:generate  
npm run db:push  
npm run db:seed  
npm run db:studio
