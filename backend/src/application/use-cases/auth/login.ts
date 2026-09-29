import { z } from "zod";
import { UnauthorizedError } from "../../../domain/errors/app-error";
import { toPublicUser } from "../../../domain/entities/user";
import type { UsersRepository } from "../../../domain/repositories/users-repository";
import type { HashProvider } from "../../providers/hash-provider";
import type { TokenProvider } from "../../providers/token-provider";
import { validate } from "../../validation";

const schema = z.object({
  email: z.email("E-mail inválido").trim().toLowerCase(),
  password: z.string().min(1, "Informe sua senha"),
});

export type LoginInput = z.input<typeof schema>;

export class LoginUseCase {
  constructor(
    private readonly users: UsersRepository,
    private readonly hash: HashProvider,
    private readonly tokens: TokenProvider,
  ) {}

  async execute(input: LoginInput) {
    const { email, password } = validate(schema, input);
    const user = await this.users.findByEmail(email);

    // Mesma mensagem para e-mail inexistente e senha incorreta (não vaza quais e-mails existem)
    if (!user || !(await this.hash.compare(password, user.passwordHash))) {
      throw new UnauthorizedError("E-mail ou senha inválidos");
    }

    return { token: this.tokens.sign({ sub: user.id }), user: toPublicUser(user) };
  }
}
