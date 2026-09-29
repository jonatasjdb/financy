import { NotFoundError } from "../../../domain/errors/app-error";
import { toPublicUser } from "../../../domain/entities/user";
import type { UsersRepository } from "../../../domain/repositories/users-repository";

export class GetProfileUseCase {
  constructor(private readonly users: UsersRepository) {}

  async execute(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError("Usuário");
    return toPublicUser(user);
  }
}
