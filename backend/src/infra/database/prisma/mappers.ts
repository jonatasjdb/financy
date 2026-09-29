import type {
  Category as PrismaCategory,
  Transaction as PrismaTransaction,
  User as PrismaUser,
} from "./generated/client";
import type { User } from "../../../domain/entities/user";
import type { Category, CategoryColor, CategoryIcon } from "../../../domain/entities/category";
import type {
  TransactionType,
  TransactionWithCategory,
} from "../../../domain/entities/transaction";

export function toDomainUser(raw: PrismaUser): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    passwordHash: raw.password,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function toDomainCategory(raw: PrismaCategory): Category {
  return {
    ...raw,
    icon: raw.icon as CategoryIcon,
    color: raw.color as CategoryColor,
  };
}

export function toDomainTransaction(
  raw: PrismaTransaction & { category: PrismaCategory },
): TransactionWithCategory {
  return {
    ...raw,
    type: raw.type as TransactionType,
    category: toDomainCategory(raw.category),
  };
}
