import { randomUUID } from "node:crypto";
import type { User } from "../../src/domain/entities/user";
import type { Category } from "../../src/domain/entities/category";
import type { TransactionWithCategory } from "../../src/domain/entities/transaction";
import type { CreateUserData, UsersRepository } from "../../src/domain/repositories/users-repository";
import type { CategoriesRepository, CategoryData } from "../../src/domain/repositories/categories-repository";
import type {
  TransactionData,
  TransactionFilters,
  TransactionsRepository,
} from "../../src/domain/repositories/transactions-repository";
import type { HashProvider } from "../../src/application/providers/hash-provider";
import type { TokenPayload, TokenProvider } from "../../src/application/providers/token-provider";

export class InMemoryUsersRepository implements UsersRepository {
  items: User[] = [];
  async findById(id: string) { return this.items.find((u) => u.id === id) ?? null; }
  async findByEmail(email: string) { return this.items.find((u) => u.email === email) ?? null; }
  async create(data: CreateUserData) {
    const user: User = { id: randomUUID(), ...data, createdAt: new Date(), updatedAt: new Date() };
    this.items.push(user);
    return user;
  }
  async update(id: string, data: { name: string }) {
    const user = this.items.find((u) => u.id === id)!;
    Object.assign(user, data, { updatedAt: new Date() });
    return user;
  }
}

export class InMemoryCategoriesRepository implements CategoriesRepository {
  items: Category[] = [];
  async findById(id: string) { return this.items.find((c) => c.id === id) ?? null; }
  async findManyByUser(userId: string) { return this.items.filter((c) => c.userId === userId); }
  async create(userId: string, data: CategoryData) {
    const category: Category = { id: randomUUID(), ...data, userId, createdAt: new Date(), updatedAt: new Date() };
    this.items.push(category);
    return category;
  }
  async update(id: string, data: CategoryData) {
    const category = this.items.find((c) => c.id === id)!;
    Object.assign(category, data);
    return category;
  }
  async delete(id: string) { this.items = this.items.filter((c) => c.id !== id); }
}

export class InMemoryTransactionsRepository implements TransactionsRepository {
  items: TransactionWithCategory[] = [];
  constructor(private readonly categories: InMemoryCategoriesRepository) {}

  private withCategory(data: TransactionData) {
    return { ...data, category: this.categories.items.find((c) => c.id === data.categoryId)! };
  }
  async findById(id: string) { return this.items.find((t) => t.id === id) ?? null; }
  async findManyByUser(userId: string, f: TransactionFilters = {}) {
    return this.items.filter(
      (t) =>
        t.userId === userId &&
        (!f.type || t.type === f.type) &&
        (!f.categoryId || t.categoryId === f.categoryId) &&
        (!f.search || t.description.toLowerCase().includes(f.search.toLowerCase())) &&
        (!f.startDate || t.date >= f.startDate) &&
        (!f.endDate || t.date < f.endDate),
    );
  }
  async create(userId: string, data: TransactionData) {
    const t = { id: randomUUID(), userId, createdAt: new Date(), updatedAt: new Date(), ...this.withCategory(data) };
    this.items.push(t);
    return t;
  }
  async update(id: string, data: TransactionData) {
    const t = this.items.find((i) => i.id === id)!;
    Object.assign(t, this.withCategory(data));
    return t;
  }
  async delete(id: string) { this.items = this.items.filter((t) => t.id !== id); }
  async countByCategory(categoryId: string) { return this.items.filter((t) => t.categoryId === categoryId).length; }
  async totalsByCategory(userId: string) {
    const map = new Map<string, { categoryId: string; count: number; totalInCents: number }>();
    for (const t of this.items.filter((i) => i.userId === userId)) {
      const entry = map.get(t.categoryId) ?? { categoryId: t.categoryId, count: 0, totalInCents: 0 };
      entry.count += 1;
      entry.totalInCents += t.amountInCents;
      map.set(t.categoryId, entry);
    }
    return [...map.values()];
  }
  async totalsByType(userId: string, range?: { startDate: Date; endDate: Date }) {
    const list = await this.findManyByUser(userId, range ?? {});
    const sum = (type: string) => list.filter((t) => t.type === type).reduce((s, t) => s + t.amountInCents, 0);
    return { incomeInCents: sum("INCOME"), expenseInCents: sum("EXPENSE") };
  }
}

export class FakeHashProvider implements HashProvider {
  async hash(plain: string) { return `hashed:${plain}`; }
  async compare(plain: string, hash: string) { return hash === `hashed:${plain}`; }
}

export class FakeTokenProvider implements TokenProvider {
  sign(payload: TokenPayload) { return `token:${payload.sub}`; }
  verify(token: string) { return token.startsWith("token:") ? { sub: token.slice(6) } : null; }
}
