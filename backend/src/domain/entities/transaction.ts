import type { Category } from "./category";

export const TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export interface Transaction {
  id: string;
  description: string;
  /** Valor sempre positivo, em centavos. O sinal é dado por `type`. */
  amountInCents: number;
  type: TransactionType;
  date: Date;
  categoryId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionWithCategory extends Transaction {
  category: Category;
}
