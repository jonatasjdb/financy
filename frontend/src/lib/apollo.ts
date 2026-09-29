import { ApolloClient, ApolloLink, CombinedGraphQLErrors, HttpLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { authStorage } from "./auth-storage";

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_BACKEND_URL ?? "http://localhost:4000/graphql",
});

const authLink = new SetContextLink((prevContext) => {
  const token = authStorage.getToken();
  return {
    headers: {
      ...prevContext.headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

/** Listeners avisados quando a API responde UNAUTHENTICATED (token expirado/inválido). */
const unauthorizedListeners = new Set<() => void>();
export function onUnauthorized(listener: () => void) {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

const errorLink = new ErrorLink(({ error, operation }) => {
  const isAuthOperation = ["Login", "Register"].includes(operation.operationName ?? "");
  if (
    !isAuthOperation &&
    CombinedGraphQLErrors.is(error) &&
    error.errors.some((e) => e.extensions?.code === "UNAUTHENTICATED")
  ) {
    unauthorizedListeners.forEach((listener) => listener());
  }
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});

/** Extrai uma mensagem amigável de qualquer erro do Apollo. */
export function getErrorMessage(error: unknown) {
  if (CombinedGraphQLErrors.is(error)) return error.errors[0]?.message ?? "Erro inesperado";
  if (error instanceof Error && /fetch/i.test(error.message)) {
    return "Não foi possível conectar à API. Verifique se o back-end está rodando.";
  }
  return error instanceof Error ? error.message : "Erro inesperado";
}
