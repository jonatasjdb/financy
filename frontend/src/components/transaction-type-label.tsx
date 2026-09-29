import { CircleArrowDown, CircleArrowUp } from "lucide-react";
import type { TransactionType } from "@/graphql/types";

export function TransactionTypeLabel({ type }: { type: TransactionType }) {
  return type === "INCOME" ? (
    <span className="inline-flex items-center gap-2 align-middle text-sm leading-5 font-medium text-green-dark">
      <CircleArrowUp className="size-4 text-green-base" aria-hidden /> Entrada
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 align-middle text-sm leading-5 font-medium text-red-dark">
      <CircleArrowDown className="size-4 text-red-base" aria-hidden /> Saída
    </span>
  );
}

/** "+ R$ 4.250,00" / "- R$ 89,50" */
export function signedAmount(type: TransactionType, formatted: string) {
  return `${type === "INCOME" ? "+" : "-"} ${formatted}`;
}
