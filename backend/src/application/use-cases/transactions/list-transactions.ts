import { z } from "zod";
import { TRANSACTION_TYPES } from "../../../domain/entities/transaction";
import type {
  TransactionFilters,
  TransactionsRepository,
} from "../../../domain/repositories/transactions-repository";
import { validate } from "../../validation";
import { monthRange } from "./month-range";

const schema = z
  .object({
    search: z.string().trim().nullish(),
    type: z.enum(TRANSACTION_TYPES).nullish(),
    categoryId: z.string().nullish(),
    month: z.number().int().min(1).max(12).nullish(),
    year: z.number().int().min(1970).max(9999).nullish(),
  })
  .refine((f) => !f.month || f.year, "Informe o ano junto com o mês");

export type ListTransactionsInput = z.input<typeof schema>;

export class ListTransactionsUseCase {
  constructor(private readonly transactions: TransactionsRepository) {}

  async execute(userId: string, input: ListTransactionsInput = {}) {
    const f = validate(schema, input);
    const filters: TransactionFilters = {
      search: f.search || undefined,
      type: f.type ?? undefined,
      categoryId: f.categoryId ?? undefined,
    };

    if (f.year && f.month) Object.assign(filters, monthRange(f.year, f.month));
    else if (f.year) {
      filters.startDate = new Date(Date.UTC(f.year, 0, 1));
      filters.endDate = new Date(Date.UTC(f.year + 1, 0, 1));
    }

    return this.transactions.findManyByUser(userId, filters);
  }
}
