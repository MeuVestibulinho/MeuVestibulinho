

// Marca o arquivo como um componente React que roda no cliente (browser)
// Isso é necessário para usar hooks como useState, useEffect, etc.
// hooks são funções especiais do React que só funcionam em componentes de cliente
// componentes de cliente são aqueles que rodam no browser, não no servidor
// browser = navegador (Chrome, Firefox, Edge, etc.)
// servidor = backend (Node.js, etc.)
"use client"; 

// Importa o hook useState do React para gerenciar estado local no componente
// useState é um hook que permite criar variáveis de estado em componentes funcionais
// variáveis de estado são aquelas que podem mudar ao longo do tempo, como o valor de um input
// quando o estado muda, o componente re-renderiza para refletir a nova informação
// aqui usamos useState para controlar o valor do input de nome do post, e para limpar o input após criar o post
import { useState } from "react";


// Importa o objeto api do TRPC para fazer chamadas às rotas definidas no backend
// TRPC é uma biblioteca que facilita a comunicação entre frontend e backend com TypeScript
// Com rotas, eu quero dizer as funções que definimos no backend para criar, ler, atualizar e deletar dados (GET, POST, PUT, DELETE)
import { api } from "~/trpc/react";


// Essa função é um componente React que exibe o post mais recente do usuário e um formulário para criar novos posts
// Isso é util para testar a integração do TRPC com o backend, permitindo criar e listar posts, verificando se tudo está funcionando corretamente
export function LatestPost() {

  // Usa uma query( query é uma função que busca dados ) do TRPC para buscar o post mais recente do usuário
  // Cria uma constante latestPost que guarda o resultado da query
  // useSuspenseQuery é um hook do TRPC que usa o recurso de Suspense do React para lidar com carregamento de dados
  // Suspense é uma funcionalidade do React que permite "pausar" a renderização de um componente até que uma promessa (Promise) seja resolvida
  const [latestPost] = api.post.getLatest.useSuspenseQuery(); 

  // Cria uma constante utils que guarda o objeto de utilitários do TRPC
  const utils = api.useUtils();
  // Cria uma variável de estado name para controlar o valor do input de nome do post
  // Inicializa name como uma string vazia "" usando useState
  // setName é a função que atualiza o valor de name
  const [name, setName] = useState("");
  // Cria uma mutação do TRPC para criar um novo post
  // useMutation é um hook do TRPC que permite fazer chamadas a rotas que modificam dados (POST, PUT, DELETE)
  const createPost = api.post.create.useMutation({
    onSuccess: async () => { // onSuccess é uma função que roda quando a mutação é bem sucedida
      await utils.post.invalidate(); // Invalida o cache da query de posts para forçar uma atualização dos dados
      setName(""); // Limpa o input de nome do post após criar o post com sucesso (define name como "")
    },
  });


  // Retorna o JSX que define a interface do componente
  // JSX é uma sintaxe que mistura HTML e JavaScript, usada pelo React para definir a UI (User Interface = interface do usuário)
  // Aqui exibimos o post mais recente (se existir) e um formulário com um input e um botão para criar novos posts
  return (
    <div className="w-full max-w-xs"> {/* Container com largura máxima de 20rem (320px) */}
      {latestPost ? ( // Se latestPost existir (não for null ou undefined), exibe o nome do post
        <p className="truncate">Your most recent post: {latestPost.name}</p> // truncate é uma classe do Tailwind CSS que corta o texto que ultrapassa o tamanho do container
      ) : (
        <p>You have no posts yet.</p> // Se latestPost não existir, exibe uma mensagem indicando que não há posts
      )}
      <form // Formulário para criar um novo post
        onSubmit={(e) => { // onSubmit é uma função que roda quando o formulário é enviado (botão de submit clicado)
          e.preventDefault(); // Evita o comportamento padrão do formulário (recarregar a página)
          createPost.mutate({ name }); // Chama a mutação createPost com o nome do post vindo do input
        }}
        className="flex flex-col gap-2" // flex flex-col gap-2 são classes do Tailwind CSS para layout flexível em coluna com espaçamento entre os itens
      >
        <input // Input para digitar o nome do post
          type="text" // Tipo do input é texto
          placeholder="Title" // Placeholder é o texto que aparece quando o input está vazio
          value={name} // O valor do input é controlado pela variável de estado name
          onChange={(e) => setName(e.target.value)} // onChange é uma função que roda quando o valor do input muda, atualiza name com o novo valor
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white" // Classes do Tailwind CSS para estilizar o input(largura total, bordas arredondadas, fundo semi-transparente, padding, texto branco)
        />
        <button // Botão para enviar o formulário e criar o post
          type="submit" // Tipo do botão é submit, o que faz o formulário ser enviado quando clicado
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20" // Classes do Tailwind CSS para estilizar o botão (bordas arredondadas, fundo semi-transparente, padding, fonte em negrito, efeito de transição ao passar o mouse)
          disabled={createPost.isPending} // Desabilita o botão enquanto a mutação createPost está pendente (evita múltiplos envios)
        >
          {createPost.isPending ? "Submitting..." : "Submit"} 
        </button>
      </form> 
    </div> 
  );
}


// Nesse arquivo definimos um componente React que exibe o post mais recente do usuário e um formulário para criar novos posts
// Isso é util para testar a integração do TRPC( biblioteca que facilita a comunicação entre o frontend e o backend ) com o backend,
// permitindo criar e listar posts, verificando se tudo está funcionando corretamente
// Usamos hooks do React como useState para gerenciar estado local, e hooks do TRPC como useSuspenseQuery e useMutation para buscar e modificar dados no backend
// A interface é estilizada com classes do Tailwind CSS para um visual simples e responsivo
// Esse componente pode ser usado em qualquer página do Next.js para testar a funcionalidade de posts