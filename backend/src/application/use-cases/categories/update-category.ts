import type { CategoriesRepository } from "../../../domain/repositories/categories-repository";
import type { TransactionsRepository } from "../../../domain/repositories/transactions-repository";
import type { CategoryWithStats } from "../../../domain/entities/category";
import { validate } from "../../validation";
import { categorySchema, type CategoryInput } from "./category-schema";
import { findOwnedCategory } from "./find-owned-category";

export class UpdateCategoryUseCase {
  constructor(
    private readonly categories: CategoriesRepository,
    private readonly transactions: TransactionsRepository,
  ) {}

  async execute(userId: string, id: string, input: CategoryInput): Promise<CategoryWithStats> {
    const data = validate(categorySchema, input);
    await findOwnedCategory(this.categories, userId, id);

    const category = await this.categories.update(id, data);
    const totals = (await this.transactions.totalsByCategory(userId)).find(
      (t) => t.categoryId === id,
    );

    return {
      ...category,
      transactionsCount: totals?.count ?? 0,
      totalAmountInCents: totals?.totalInCents ?? 0,
    };
  }
}
