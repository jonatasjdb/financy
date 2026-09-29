export type TransactionType = "INCOME" | "EXPENSE";

export type CategoryColor = "green" | "blue" | "purple" | "pink" | "red" | "orange" | "yellow";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  color: CategoryColor;
  transactionsCount: number;
  totalAmount: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category: Pick<Category, "id" | "title" | "icon" | "color">;
}

export interface Summary {
  balance: number;
  monthIncome: number;
  monthExpense: number;
}

export interface CategoryInput {
  title: string;
  description?: string | null;
  icon: string;
  color: CategoryColor;
}

export interface TransactionInput {
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  categoryId: string;
}

export interface TransactionFilter {
  search?: string;
  type?: TransactionType;
  categoryId?: string;
  month?: number;
  year?: number;
}
