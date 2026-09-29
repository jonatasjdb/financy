import type { CategoriesRepository } from "../../../domain/repositories/categories-repository";
import type { TransactionsRepository } from "../../../domain/repositories/transactions-repository";
import { validate } from "../../validation";
import { findOwnedCategory } from "../categories/find-owned-category";
import { toTransactionData, transactionSchema, type TransactionInput } from "./transaction-schema";

export class CreateTransactionUseCase {
  constructor(
    private readonly transactions: TransactionsRepository,
    private readonly categories: CategoriesRepository,
  ) {}

  async execute(userId: string, input: TransactionInput) {
    const data = toTransactionData(validate(transactionSchema, input));
    await findOwnedCategory(this.categories, userId, data.categoryId);
    return this.transactions.create(userId, data);
  }
}
