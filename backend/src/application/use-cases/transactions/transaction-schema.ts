import { z } from "zod";
import { TRANSACTION_TYPES } from "../../../domain/entities/transaction";

/** Converte "YYYY-MM-DD" (ou ISO) para Date às 12:00 UTC, evitando mudança de dia por fuso. */
function toDate(value: string): Date {
  const day = value.slice(0, 10);
  return new Date(`${day}T12:00:00.000Z`);
}

export const transactionSchema = z.object({
  description: z.string().trim().min(1, "Informe a descrição").max(80, "Descrição muito longa"),
  amount: z
    .number("Informe o valor")
    .positive("O valor deve ser maior que zero")
    .max(999_999_999, "Valor muito alto"),
  type: z.enum(TRANSACTION_TYPES, "Tipo inválido"),
  date: z
    .string("Informe a data")
    .regex(/^\d{4}-\d{2}-\d{2}/, "Data inválida")
    .transform(toDate)
    .refine((d) => !Number.isNaN(d.getTime()), "Data inválida"),
  categoryId: z.string("Selecione uma categoria").min(1, "Selecione uma categoria"),
});

export type TransactionInput = z.input<typeof transactionSchema>;

export function toTransactionData(input: z.output<typeof transactionSchema>) {
  const { amount, ...rest } = input;
  return { ...rest, amountInCents: Math.round(amount * 100) };
}
