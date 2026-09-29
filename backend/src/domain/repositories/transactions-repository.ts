import type { TransactionType, TransactionWithCategory } from "../entities/transaction";

export interface TransactionData {
  description: string;
  amountInCents: number;
  type: TransactionType;
  date: Date;
  categoryId: string;
}

export interface TransactionFilters {
  search?: string;
  type?: TransactionType;
  categoryId?: string;
  /** Intervalo [startDate, endDate) */
  startDate?: Date;
  endDate?: Date;
}

export interface CategoryTotals {
  categoryId: string;
  count: number;
  totalInCents: number;
}

export interface TypeTotals {
  incomeInCents: number;
  expenseInCents: number;
}

export interface TransactionsRepository {
  findById(id: string): Promise<TransactionWithCategory | null>;
  findManyByUser(userId: string, filters?: TransactionFilters): Promise<TransactionWithCategory[]>;
  create(userId: string, data: TransactionData): Promise<TransactionWithCategory>;
  update(id: string, data: TransactionData): Promise<TransactionWithCategory>;
  delete(id: string): Promise<void>;
  countByCategory(categoryId: string): Promise<number>;
  totalsByCategory(userId: string): Promise<CategoryTotals[]>;
  totalsByType(userId: string, range?: { startDate: Date; endDate: Date }): Promise<TypeTotals>;
}
