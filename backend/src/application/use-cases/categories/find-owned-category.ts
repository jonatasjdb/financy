import { NotFoundError } from "../../../domain/errors/app-error";
import type { Category } from "../../../domain/entities/category";
import type { CategoriesRepository } from "../../../domain/repositories/categories-repository";

/**
 * Busca uma categoria garantindo que pertence ao usuário.
 * Categorias de outros usuários são tratadas como inexistentes.
 */
export async function findOwnedCategory(
  categories: CategoriesRepository,
  userId: string,
  categoryId: string,
): Promise<Category> {
  const category = await categories.findById(categoryId);
  if (!category || category.userId !== userId) throw new NotFoundError("Categoria");
  return category;
}
