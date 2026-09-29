import type { PublicUser } from "../../domain/entities/user";
import type { CategoryWithStats, Category } from "../../domain/entities/category";
import type { TransactionWithCategory } from "../../domain/entities/transaction";
import type { Summary } from "../../application/use-cases/transactions/get-summary";

/** Camada de apresentação: converte entidades de domínio para o formato do schema GraphQL. */
const toReais = (cents: number) => cents / 100;

export const presentUser = (user: PublicUser) => ({
  ...user,
  createdAt: user.createdAt.toISOString(),
});

export const presentCategory = (category: Category | CategoryWithStats) => ({
  ...category,
  createdAt: category.createdAt.toISOString(),
  transactionsCount: "transactionsCount" in category ? category.transactionsCount : undefined,
  totalAmount:
    "totalAmountInCents" in category ? toReais(category.totalAmountInCents) : undefined,
});

export const presentTransaction = (transaction: TransactionWithCategory) => ({
  ...transaction,
  amount: toReais(transaction.amountInCents),
  date: transaction.date.toISOString(),
  createdAt: transaction.createdAt.toISOString(),
  category: presentCategory(transaction.category),
});

export const presentSummary = (summary: Summary) => ({
  balance: toReais(summary.balanceInCents),
  monthIncome: toReais(summary.monthIncomeInCents),
  monthExpense: toReais(summary.monthExpenseInCents),
});
