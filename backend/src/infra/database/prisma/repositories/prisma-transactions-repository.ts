import type { Prisma, PrismaClient } from "../generated/client";
import type {
  TransactionData,
  TransactionFilters,
  TransactionsRepository,
} from "../../../../domain/repositories/transactions-repository";
import { toDomainTransaction } from "../mappers";

const include = { category: true } as const;

export class PrismaTransactionsRepository implements TransactionsRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    const transaction = await this.db.transaction.findUnique({ where: { id }, include });
    return transaction && toDomainTransaction(transaction);
  }

  async findManyByUser(userId: string, filters: TransactionFilters = {}) {
    const where: Prisma.TransactionWhereInput = {
      userId,
      type: filters.type,
      categoryId: filters.categoryId,
      description: filters.search ? { contains: filters.search } : undefined,
      date:
        filters.startDate || filters.endDate
          ? { gte: filters.startDate, lt: filters.endDate }
          : undefined,
    };

    const transactions = await this.db.transaction.findMany({
      where,
      include,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
    return transactions.map(toDomainTransaction);
  }

  async create(userId: string, data: TransactionData) {
    return toDomainTransaction(
      await this.db.transaction.create({ data: { ...data, userId }, include }),
    );
  }

  async update(id: string, data: TransactionData) {
    return toDomainTransaction(await this.db.transaction.update({ where: { id }, data, include }));
  }

  async delete(id: string) {
    await this.db.transaction.delete({ where: { id } });
  }

  async countByCategory(categoryId: string) {
    return this.db.transaction.count({ where: { categoryId } });
  }

  async totalsByCategory(userId: string) {
    const groups = await this.db.transaction.groupBy({
      by: ["categoryId"],
      where: { userId },
      _count: { _all: true },
      _sum: { amountInCents: true },
    });
    return groups.map((g) => ({
      categoryId: g.categoryId,
      count: g._count._all,
      totalInCents: g._sum.amountInCents ?? 0,
    }));
  }

  async totalsByType(userId: string, range?: { startDate: Date; endDate: Date }) {
    const groups = await this.db.transaction.groupBy({
      by: ["type"],
      where: { userId, date: range ? { gte: range.startDate, lt: range.endDate } : undefined },
      _sum: { amountInCents: true },
    });
    const sumOf = (type: string) =>
      groups.find((g) => g.type === type)?._sum.amountInCents ?? 0;
    return { incomeInCents: sumOf("INCOME"), expenseInCents: sumOf("EXPENSE") };
  }
}
