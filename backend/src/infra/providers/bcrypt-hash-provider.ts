import bcrypt from "bcryptjs";
import type { HashProvider } from "../../application/providers/hash-provider";

export class BcryptHashProvider implements HashProvider {
  constructor(private readonly rounds = 10) {}

  hash(plain: string) {
    return bcrypt.hash(plain, this.rounds);
  }

  compare(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }
}
