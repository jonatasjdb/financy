import type { PrismaClient } from "../generated/client";
import type {
  CategoriesRepository,
  CategoryData,
} from "../../../../domain/repositories/categories-repository";
import { toDomainCategory } from "../mappers";

export class PrismaCategoriesRepository implements CategoriesRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    const category = await this.db.category.findUnique({ where: { id } });
    return category && toDomainCategory(category);
  }

  async findManyByUser(userId: string) {
    const categories = await this.db.category.findMany({
      where: { userId },
      orderBy: { title: "asc" },
    });
    return categories.map(toDomainCategory);
  }

  async create(userId: string, data: CategoryData) {
    return toDomainCategory(await this.db.category.create({ data: { ...data, userId } }));
  }

  async update(id: string, data: CategoryData) {
    return toDomainCategory(await this.db.category.update({ where: { id }, data }));
  }

  async delete(id: string) {
    await this.db.category.delete({ where: { id } });
  }
}
