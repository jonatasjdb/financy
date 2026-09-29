import jwt, { type SignOptions } from "jsonwebtoken";
import type { TokenPayload, TokenProvider } from "../../application/providers/token-provider";

export class JwtTokenProvider implements TokenProvider {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: SignOptions["expiresIn"],
  ) {}

  sign(payload: TokenPayload) {
    return jwt.sign({}, this.secret, { subject: payload.sub, expiresIn: this.expiresIn });
  }

  verify(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret);
      return typeof decoded === "object" && decoded.sub ? { sub: decoded.sub } : null;
    } catch {
      return null;
    }
  }
}
