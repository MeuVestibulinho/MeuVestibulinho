// Importa o QueryClient do React Query para gerenciar o estado de consultas de dados na aplicação
// Também importa DefaultShouldDehydrateQuery para personalizar a serialização/deserialização de dados ao usar SSR (Server-Side Rendering)
// Serialização é o processo de converter um objeto em um formato que pode ser facilmente armazenado ou transmitido (como JSON)
// Deserialização é o processo inverso, convertendo o formato armazenado/transmitido de volta para um objeto
import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";

// Importa SuperJSON, uma biblioteca que facilita a serialização e deserialização de dados complexos (como datas, mapas, conjuntos, etc.) para JSON
// SuperJSON é útil quando precisamos enviar dados entre o servidor e o cliente
import SuperJSON from "superjson";

// Cria e configura uma instância do QueryClient para ser usada na aplicação
export const createQueryClient = () =>
  new QueryClient({
    // Cria uma nova instância do QueryClient
    defaultOptions: {
      // Define opções padrão para o QueryClient
      queries: {
        // Configurações específicas para consultas (queries)
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000, // Define o tempo (em milissegundos) que os dados são considerados "frescos" antes de serem refetchados (30 segundos aqui)
      },
      dehydrate: {
        // Configurações para desidratação (dehydrate) e hidratação (hydrate) de dados, úteis para SSR
        serializeData: SuperJSON.serialize, // Usa SuperJSON para serializar os dados antes de enviá-los ao cliente
        shouldDehydrateQuery: (
          query, // Personaliza a lógica para decidir se uma consulta deve ser desidratada
        ) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending", // Também desidrata consultas que estão no estado "pending" (pendente)
      },
      hydrate: {
        // Configurações para hidratação de dados no cliente
        deserializeData: SuperJSON.deserialize, // Usa SuperJSON para desserializar os dados recebidos do servidor
      },
    },
  });

// Nesse arquivo definimos a configuração do QueryClient do React Query para gerenciar o estado de consultas de dados na aplicação
// Incluímos opções padrão para consultas, como staleTime para evitar refetching imediato no cliente
// Também configuramos a serialização e deserialização de dados usando SuperJSON, facilitando o envio de dados complexos entre o servidor e o cliente
// Além disso, personalizamos a lógica para decidir se uma consulta deve ser desidratada, incluindo consultas pendentes
// Essa configuração é especialmente útil quando usamos SSR (Server-Side Rendering) para melhorar a performance e a experiência do usuário
