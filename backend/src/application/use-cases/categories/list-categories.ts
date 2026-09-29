import type { CategoriesRepository } from "../../../domain/repositories/categories-repository";
import type { TransactionsRepository } from "../../../domain/repositories/transactions-repository";
import type { CategoryWithStats } from "../../../domain/entities/category";

export class ListCategoriesUseCase {
  constructor(
    private readonly categories: CategoriesRepository,
    private readonly transactions: TransactionsRepository,
  ) {}

  async execute(userId: string): Promise<CategoryWithStats[]> {
    const [categories, totals] = await Promise.all([
      this.categories.findManyByUser(userId),
      this.transactions.totalsByCategory(userId),
    ]);
    const totalsById = new Map(totals.map((t) => [t.categoryId, t]));

    return categories.map((category) => ({
      ...category,
      transactionsCount: totalsById.get(category.id)?.count ?? 0,
      totalAmountInCents: totalsById.get(category.id)?.totalInCents ?? 0,
    }));
  }
}
