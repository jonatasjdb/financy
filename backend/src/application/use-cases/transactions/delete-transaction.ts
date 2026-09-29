import type { TransactionsRepository } from "../../../domain/repositories/transactions-repository";
import { findOwnedTransaction } from "./find-owned-transaction";

export class DeleteTransactionUseCase {
  constructor(private readonly transactions: TransactionsRepository) {}

  async execute(userId: string, id: string): Promise<void> {
    await findOwnedTransaction(this.transactions, userId, id);
    await this.transactions.delete(id);
  }
}
