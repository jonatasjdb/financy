const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const number = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 1234.5 -> "R$ 1.234,50" */
export function formatCurrency(value: number) {
  return currency.format(value).replace(/ /g, " ");
}

/** 1234.5 -> "1.234,50" (sem símbolo) */
export function formatAmount(value: number) {
  return number.format(value);
}

/** Data ISO (armazenada ao meio-dia UTC) -> "30/11/25" */
export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: "UTC",
  });
}

/** Data ISO -> "2025-11-30" (valor de <input type="date">) */
export function toDateInputValue(iso: string) {
  return iso.slice(0, 10);
}

export function todayInputValue() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** "Conta teste" -> "CT" */
export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function pluralizeItems(count: number) {
  return `${count} ${count === 1 ? "item" : "itens"}`;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function monthLabel(month: number, year: number) {
  return `${MONTHS[month - 1]} / ${year}`;
}
