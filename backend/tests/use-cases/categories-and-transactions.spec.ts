import { beforeEach, describe, expect, it } from "vitest";
import { CreateCategoryUseCase } from "../../src/application/use-cases/categories/create-category";
import { UpdateCategoryUseCase } from "../../src/application/use-cases/categories/update-category";
import { DeleteCategoryUseCase } from "../../src/application/use-cases/categories/delete-category";
import { ListCategoriesUseCase } from "../../src/application/use-cases/categories/list-categories";
import { CreateTransactionUseCase } from "../../src/application/use-cases/transactions/create-transaction";
import { UpdateTransactionUseCase } from "../../src/application/use-cases/transactions/update-transaction";
import { DeleteTransactionUseCase } from "../../src/application/use-cases/transactions/delete-transaction";
import { ListTransactionsUseCase } from "../../src/application/use-cases/transactions/list-transactions";
import { GetSummaryUseCase } from "../../src/application/use-cases/transactions/get-summary";
import { InMemoryCategoriesRepository, InMemoryTransactionsRepository } from "../in-memory/repositories";

const ALICE = "user-alice";
const BOB = "user-bob";

describe("Categorias e transações", () => {
  let categories: InMemoryCategoriesRepository;
  let transactions: InMemoryTransactionsRepository;
  let uc: ReturnType<typeof build>;

  function build() {
    return {
      createCategory: new CreateCategoryUseCase(categories),
      updateCategory: new UpdateCategoryUseCase(categories, transactions),
      deleteCategory: new DeleteCategoryUseCase(categories, transactions),
      listCategories: new ListCategoriesUseCase(categories, transactions),
      createTransaction: new CreateTransactionUseCase(transactions, categories),
      updateTransaction: new UpdateTransactionUseCase(transactions, categories),
      deleteTransaction: new DeleteTransactionUseCase(transactions),
      listTransactions: new ListTransactionsUseCase(transactions),
      getSummary: new GetSummaryUseCase(transactions),
    };
  }

  beforeEach(() => {
    categories = new InMemoryCategoriesRepository();
    transactions = new InMemoryTransactionsRepository(categories);
    uc = build();
  });

  const food = { title: "Alimentação", icon: "utensils", color: "blue" } as const;

  it("cria, edita e lista categorias com estatísticas", async () => {
    const category = await uc.createCategory.execute(ALICE, food);
    await uc.updateCategory.execute(ALICE, category.id, { ...food, title: "Comida" });
    await uc.createTransaction.execute(ALICE, {
      description: "Almoço", amount: 25.5, type: "EXPENSE", date: "2026-09-10", categoryId: category.id,
    });

    const [listed] = await uc.listCategories.execute(ALICE);
    expect(listed).toMatchObject({ title: "Comida", transactionsCount: 1, totalAmountInCents: 2550 });
  });

  it("isola dados entre usuários", async () => {
    const category = await uc.createCategory.execute(ALICE, food);
    const tx = await uc.createTransaction.execute(ALICE, {
      description: "Almoço", amount: 10, type: "EXPENSE", date: "2026-09-10", categoryId: category.id,
    });

    expect(await uc.listCategories.execute(BOB)).toHaveLength(0);
    expect(await uc.listTransactions.execute(BOB)).toHaveLength(0);
    await expect(uc.updateCategory.execute(BOB, category.id, food)).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(uc.deleteTransaction.execute(BOB, tx.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      uc.createTransaction.execute(BOB, {
        description: "X", amount: 1, type: "EXPENSE", date: "2026-09-10", categoryId: category.id,
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("impede excluir categoria com transações e permite após removê-las", async () => {
    const category = await uc.createCategory.execute(ALICE, food);
    const tx = await uc.createTransaction.execute(ALICE, {
      description: "Almoço", amount: 10, type: "EXPENSE", date: "2026-09-10", categoryId: category.id,
    });

    await expect(uc.deleteCategory.execute(ALICE, category.id)).rejects.toMatchObject({ code: "CONFLICT" });
    await uc.deleteTransaction.execute(ALICE, tx.id);
    await uc.deleteCategory.execute(ALICE, category.id);
    expect(categories.items).toHaveLength(0);
  });

  it("edita transação e armazena valores em centavos", async () => {
    const category = await uc.createCategory.execute(ALICE, food);
    const tx = await uc.createTransaction.execute(ALICE, {
      description: "Almoço", amount: 0.1 + 0.2, type: "EXPENSE", date: "2026-09-10", categoryId: category.id,
    });
    expect(tx.amountInCents).toBe(30);

    const updated = await uc.updateTransaction.execute(ALICE, tx.id, {
      description: "Salário", amount: 4250, type: "INCOME", date: "2026-09-01", categoryId: category.id,
    });
    expect(updated).toMatchObject({ description: "Salário", amountInCents: 425000, type: "INCOME" });
  });

  it("filtra transações por mês e calcula o resumo", async () => {
    const category = await uc.createCategory.execute(ALICE, food);
    const base = { categoryId: category.id, description: "T" };
    await uc.createTransaction.execute(ALICE, { ...base, amount: 1000, type: "INCOME", date: "2026-08-15" });
    await uc.createTransaction.execute(ALICE, { ...base, amount: 300, type: "INCOME", date: "2026-09-01" });
    await uc.createTransaction.execute(ALICE, { ...base, amount: 100, type: "EXPENSE", date: "2026-09-30" });

    expect(await uc.listTransactions.execute(ALICE, { month: 9, year: 2026 })).toHaveLength(2);
    expect(await uc.getSummary.execute(ALICE, { month: 9, year: 2026 })).toEqual({
      balanceInCents: 120000,
      monthIncomeInCents: 30000,
      monthExpenseInCents: 10000,
    });
  });
});
