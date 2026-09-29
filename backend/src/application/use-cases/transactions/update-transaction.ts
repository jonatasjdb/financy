import type { CategoriesRepository } from "../../../domain/repositories/categories-repository";
import type { TransactionsRepository } from "../../../domain/repositories/transactions-repository";
import { validate } from "../../validation";
import { findOwnedCategory } from "../categories/find-owned-category";
import { findOwnedTransaction } from "./find-owned-transaction";
import { toTransactionData, transactionSchema, type TransactionInput } from "./transaction-schema";

export class UpdateTransactionUseCase {
  constructor(
    private readonly transactions: TransactionsRepository,
    private readonly categories: CategoriesRepository,
  ) {}

  async execute(userId: string, id: string, input: TransactionInput) {
    const data = toTransactionData(validate(transactionSchema, input));
    await findOwnedTransaction(this.transactions, userId, id);
    await findOwnedCategory(this.categories, userId, data.categoryId);
    return this.transactions.update(id, data);
  }
}
