import { z } from "zod";
import { NotFoundError } from "../../../domain/errors/app-error";
import { toPublicUser } from "../../../domain/entities/user";
import type { UsersRepository } from "../../../domain/repositories/users-repository";
import { validate } from "../../validation";

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome completo"),
});

export class UpdateProfileUseCase {
  constructor(private readonly users: UsersRepository) {}

  async execute(userId: string, input: z.input<typeof schema>) {
    const { name } = validate(schema, input);
    if (!(await this.users.findById(userId))) throw new NotFoundError("Usuário");
    return toPublicUser(await this.users.update(userId, { name }));
  }
}
