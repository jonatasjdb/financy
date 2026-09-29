export const CATEGORY_COLORS = [
  "green",
  "blue",
  "purple",
  "pink",
  "red",
  "orange",
  "yellow",
] as const;
export type CategoryColor = (typeof CATEGORY_COLORS)[number];

export const CATEGORY_ICONS = [
  "briefcase-business",
  "car-front",
  "heart-pulse",
  "piggy-bank",
  "shopping-cart",
  "ticket",
  "tool-case",
  "utensils",
  "paw-print",
  "house",
  "gift",
  "dumbbell",
  "book-open",
  "baggage-claim",
  "mailbox",
  "receipt-text",
] as const;
export type CategoryIcon = (typeof CATEGORY_ICONS)[number];

export interface Category {
  id: string;
  title: string;
  description: string | null;
  icon: CategoryIcon;
  color: CategoryColor;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithStats extends Category {
  transactionsCount: number;
  totalAmountInCents: number;
}
