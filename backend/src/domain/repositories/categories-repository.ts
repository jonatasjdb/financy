import type { Category, CategoryColor, CategoryIcon } from "../entities/category";

export interface CategoryData {
  title: string;
  description: string | null;
  icon: CategoryIcon;
  color: CategoryColor;
}

export interface CategoriesRepository {
  findById(id: string): Promise<Category | null>;
  findManyByUser(userId: string): Promise<Category[]>;
  create(userId: string, data: CategoryData): Promise<Category>;
  update(id: string, data: CategoryData): Promise<Category>;
  delete(id: string): Promise<void>;
}
