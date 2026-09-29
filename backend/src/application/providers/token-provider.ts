export interface TokenPayload {
  sub: string;
}

export interface TokenProvider {
  sign(payload: TokenPayload): string;
  /** Retorna o payload ou `null` se o token for inválido/expirado. */
  verify(token: string): TokenPayload | null;
}
