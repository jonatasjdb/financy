import { ConflictError } from "../../../domain/errors/app-error";
import type { CategoriesRepository } from "../../../domain/repositories/categories-repository";
import type { TransactionsRepository } from "../../../domain/repositories/transactions-repository";
import { findOwnedCategory } from "./find-owned-category";

export class DeleteCategoryUseCase {
  constructor(
    private readonly categories: CategoriesRepository,
    private readonly transactions: TransactionsRepository,
  ) {}

  async execute(userId: string, id: string): Promise<void> {
    await findOwnedCategory(this.categories, userId, id);

    const count = await this.transactions.countByCategory(id);
    if (count > 0) {
      throw new ConflictError(
        `Não é possível excluir: a categoria possui ${count} transaç${count === 1 ? "ão" : "ões"}`,
      );
    }

    await this.categories.delete(id);
  }
}
