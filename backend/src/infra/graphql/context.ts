import type { TokenProvider } from "../../application/providers/token-provider";
import { UnauthorizedError } from "../../domain/errors/app-error";

export interface GraphQLContext {
  userId: string | null;
}

export function buildContext(tokens: TokenProvider, authorization?: string): GraphQLContext {
  const [scheme, token] = authorization?.split(" ") ?? [];
  if (scheme?.toLowerCase() !== "bearer" || !token) return { userId: null };
  return { userId: tokens.verify(token)?.sub ?? null };
}

/** Garante que a requisição está autenticada e retorna o id do usuário. */
export function requireUser(ctx: GraphQLContext): string {
  if (!ctx.userId) throw new UnauthorizedError();
  return ctx.userId;
}
