import type { CategoriesRepository } from "../../../domain/repositories/categories-repository";
import type { CategoryWithStats } from "../../../domain/entities/category";
import { validate } from "../../validation";
import { categorySchema, type CategoryInput } from "./category-schema";

export class CreateCategoryUseCase {
  constructor(private readonly categories: CategoriesRepository) {}

  async execute(userId: string, input: CategoryInput): Promise<CategoryWithStats> {
    const data = validate(categorySchema, input);
    const category = await this.categories.create(userId, data);
    return { ...category, transactionsCount: 0, totalAmountInCents: 0 };
  }
}
