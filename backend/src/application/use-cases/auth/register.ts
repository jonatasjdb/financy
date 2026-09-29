import { z } from "zod";
import { ConflictError } from "../../../domain/errors/app-error";
import { toPublicUser } from "../../../domain/entities/user";
import type { UsersRepository } from "../../../domain/repositories/users-repository";
import type { HashProvider } from "../../providers/hash-provider";
import type { TokenProvider } from "../../providers/token-provider";
import { validate } from "../../validation";

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome completo"),
  email: z.email("E-mail inválido").trim().toLowerCase(),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

export type RegisterInput = z.input<typeof schema>;

export class RegisterUseCase {
  constructor(
    private readonly users: UsersRepository,
    private readonly hash: HashProvider,
    private readonly tokens: TokenProvider,
  ) {}

  async execute(input: RegisterInput) {
    const { name, email, password } = validate(schema, input);

    if (await this.users.findByEmail(email)) {
      throw new ConflictError("Já existe uma conta com este e-mail");
    }

    const user = await this.users.create({
      name,
      email,
      passwordHash: await this.hash.hash(password),
    });

    return { token: this.tokens.sign({ sub: user.id }), user: toPublicUser(user) };
  }
}
