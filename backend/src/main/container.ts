import { env } from "../config/env";
import { prisma } from "../infra/database/prisma/client";
import { PrismaUsersRepository } from "../infra/database/prisma/repositories/prisma-users-repository";
import { PrismaCategoriesRepository } from "../infra/database/prisma/repositories/prisma-categories-repository";
import { PrismaTransactionsRepository } from "../infra/database/prisma/repositories/prisma-transactions-repository";
import { BcryptHashProvider } from "../infra/providers/bcrypt-hash-provider";
import { JwtTokenProvider } from "../infra/providers/jwt-token-provider";
import { RegisterUseCase } from "../application/use-cases/auth/register";
import { LoginUseCase } from "../application/use-cases/auth/login";
import { GetProfileUseCase } from "../application/use-cases/user/get-profile";
import { UpdateProfileUseCase } from "../application/use-cases/user/update-profile";
import { CreateCategoryUseCase } from "../application/use-cases/categories/create-category";
import { UpdateCategoryUseCase } from "../application/use-cases/categories/update-category";
import { DeleteCategoryUseCase } from "../application/use-cases/categories/delete-category";
import { ListCategoriesUseCase } from "../application/use-cases/categories/list-categories";
import { CreateTransactionUseCase } from "../application/use-cases/transactions/create-transaction";
import { UpdateTransactionUseCase } from "../application/use-cases/transactions/update-transaction";
import { DeleteTransactionUseCase } from "../application/use-cases/transactions/delete-transaction";
import { ListTransactionsUseCase } from "../application/use-cases/transactions/list-transactions";
import { GetSummaryUseCase } from "../application/use-cases/transactions/get-summary";

/** Composition root: único lugar onde as implementações concretas são ligadas às abstrações. */
export function buildContainer() {
  const users = new PrismaUsersRepository(prisma);
  const categories = new PrismaCategoriesRepository(prisma);
  const transactions = new PrismaTransactionsRepository(prisma);
  const hash = new BcryptHashProvider();
  const tokens = new JwtTokenProvider(env.JWT_SECRET, env.JWT_EXPIRES_IN as never);

  return {
    tokens,
    register: new RegisterUseCase(users, hash, tokens),
    login: new LoginUseCase(users, hash, tokens),
    getProfile: new GetProfileUseCase(users),
    updateProfile: new UpdateProfileUseCase(users),
    listCategories: new ListCategoriesUseCase(categories, transactions),
    createCategory: new CreateCategoryUseCase(categories),
    updateCategory: new UpdateCategoryUseCase(categories, transactions),
    deleteCategory: new DeleteCategoryUseCase(categories, transactions),
    listTransactions: new ListTransactionsUseCase(transactions),
    createTransaction: new CreateTransactionUseCase(transactions, categories),
    updateTransaction: new UpdateTransactionUseCase(transactions, categories),
    deleteTransaction: new DeleteTransactionUseCase(transactions),
    getSummary: new GetSummaryUseCase(transactions),
  };
}

export type Container = ReturnType<typeof buildContainer>;
