import type { PrismaClient } from "../generated/client";
import type {
  CreateUserData,
  UsersRepository,
} from "../../../../domain/repositories/users-repository";
import { toDomainUser } from "../mappers";

export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    const user = await this.db.user.findUnique({ where: { id } });
    return user && toDomainUser(user);
  }

  async findByEmail(email: string) {
    const user = await this.db.user.findUnique({ where: { email } });
    return user && toDomainUser(user);
  }

  async create({ name, email, passwordHash }: CreateUserData) {
    const user = await this.db.user.create({ data: { name, email, password: passwordHash } });
    return toDomainUser(user);
  }

  async update(id: string, data: { name: string }) {
    return toDomainUser(await this.db.user.update({ where: { id }, data }));
  }
}
