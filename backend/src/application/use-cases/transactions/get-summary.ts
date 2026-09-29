import { z } from "zod";
import type { TransactionsRepository } from "../../../domain/repositories/transactions-repository";
import { validate } from "../../validation";
import { monthRange } from "./month-range";

const schema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(1970).max(9999),
});

export interface Summary {
  balanceInCents: number;
  monthIncomeInCents: number;
  monthExpenseInCents: number;
}

/** Saldo total (todas as transações) e receitas/despesas do mês informado. */
export class GetSummaryUseCase {
  constructor(private readonly transactions: TransactionsRepository) {}

  async execute(userId: string, input: z.input<typeof schema>): Promise<Summary> {
    const { month, year } = validate(schema, input);
    const [all, monthTotals] = await Promise.all([
      this.transactions.totalsByType(userId),
      this.transactions.totalsByType(userId, monthRange(year, month)),
    ]);

    return {
      balanceInCents: all.incomeInCents - all.expenseInCents,
      monthIncomeInCents: monthTotals.incomeInCents,
      monthExpenseInCents: monthTotals.expenseInCents,
    };
  }
}
