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
