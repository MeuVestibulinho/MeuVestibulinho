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
