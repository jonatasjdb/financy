export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Representação pública do usuário (sem hash de senha). */
export type PublicUser = Omit<User, "passwordHash">;

export function toPublicUser({ passwordHash: _ignored, ...user }: User): PublicUser {
  return user;
}
