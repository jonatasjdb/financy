import type { GraphQLFormattedError } from "graphql";
import { unwrapResolverError } from "@apollo/server/errors";
import { AppError } from "../../domain/errors/app-error";

/** Converte erros de domínio em erros GraphQL com `extensions.code` e oculta erros internos. */
export function formatError(formatted: GraphQLFormattedError, error: unknown): GraphQLFormattedError {
  const original = unwrapResolverError(error);

  if (original instanceof AppError) {
    return { message: original.message, path: formatted.path, extensions: { code: original.code } };
  }

  const code = formatted.extensions?.code;
  if (code === "INTERNAL_SERVER_ERROR" || !code) {
    console.error(original);
    return { message: "Erro interno do servidor", extensions: { code: "INTERNAL_SERVER_ERROR" } };
  }

  return formatted;
}
