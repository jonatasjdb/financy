import { NotFoundError } from "../../../domain/errors/app-error";
import type { TransactionsRepository } from "../../../domain/repositories/transactions-repository";

export async function findOwnedTransaction(
  transactions: TransactionsRepository,
  userId: string,
  id: string,
) {
  const transaction = await transactions.findById(id);
  if (!transaction || transaction.userId !== userId) throw new NotFoundError("Transação");
  return transaction;
}
