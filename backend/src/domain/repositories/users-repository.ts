import type { User } from "../entities/user";

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export interface UsersRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: { name: string }): Promise<User>;
}
