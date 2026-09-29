import type { Container } from "../../main/container";
import type { ListTransactionsInput } from "../../application/use-cases/transactions/list-transactions";
import type { CategoryInput } from "../../application/use-cases/categories/category-schema";
import type { TransactionInput } from "../../application/use-cases/transactions/transaction-schema";
import type { RegisterInput } from "../../application/use-cases/auth/register";
import type { LoginInput } from "../../application/use-cases/auth/login";
import { requireUser, type GraphQLContext } from "./context";
import { presentCategory, presentSummary, presentTransaction, presentUser } from "./presenters";

type CategoryParent = ReturnType<typeof presentCategory>;

/**
 * Resolvers são "controllers" finos: extraem argumentos, garantem autenticação,
 * delegam ao caso de uso e formatam a saída via presenters.
 */
export function buildResolvers(c: Container) {
  return {
    Query: {
      me: async (_: unknown, __: unknown, ctx: GraphQLContext) =>
        presentUser(await c.getProfile.execute(requireUser(ctx))),

      categories: async (_: unknown, __: unknown, ctx: GraphQLContext) =>
        (await c.listCategories.execute(requireUser(ctx))).map(presentCategory),

      transactions: async (
        _: unknown,
        { filter }: { filter?: ListTransactionsInput },
        ctx: GraphQLContext,
      ) =>
        (await c.listTransactions.execute(requireUser(ctx), filter ?? {})).map(presentTransaction),

      summary: async (_: unknown, args: { month: number; year: number }, ctx: GraphQLContext) =>
        presentSummary(await c.getSummary.execute(requireUser(ctx), args)),
    },

    Mutation: {
      register: async (_: unknown, { input }: { input: RegisterInput }) => {
        const { token, user } = await c.register.execute(input);
        return { token, user: presentUser(user) };
      },

      login: async (_: unknown, { input }: { input: LoginInput }) => {
        const { token, user } = await c.login.execute(input);
        return { token, user: presentUser(user) };
      },

      updateProfile: async (_: unknown, { input }: { input: { name: string } }, ctx: GraphQLContext) =>
        presentUser(await c.updateProfile.execute(requireUser(ctx), input)),

      createCategory: async (_: unknown, { input }: { input: CategoryInput }, ctx: GraphQLContext) =>
        presentCategory(await c.createCategory.execute(requireUser(ctx), input)),

      updateCategory: async (
        _: unknown,
        { id, input }: { id: string; input: CategoryInput },
        ctx: GraphQLContext,
      ) => presentCategory(await c.updateCategory.execute(requireUser(ctx), id, input)),

      deleteCategory: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
        await c.deleteCategory.execute(requireUser(ctx), id);
        return true;
      },

      createTransaction: async (
        _: unknown,
        { input }: { input: TransactionInput },
        ctx: GraphQLContext,
      ) => presentTransaction(await c.createTransaction.execute(requireUser(ctx), input)),

      updateTransaction: async (
        _: unknown,
        { id, input }: { id: string; input: TransactionInput },
        ctx: GraphQLContext,
      ) => presentTransaction(await c.updateTransaction.execute(requireUser(ctx), id, input)),

      deleteTransaction: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
        await c.deleteTransaction.execute(requireUser(ctx), id);
        return true;
      },
    },

    // Quando a categoria vem aninhada em uma transação, as estatísticas são calculadas sob demanda.
    Category: {
      transactionsCount: async (parent: CategoryParent, _: unknown, ctx: GraphQLContext) =>
        parent.transactionsCount ?? (await statsFor(c, ctx, parent.id)).transactionsCount,
      totalAmount: async (parent: CategoryParent, _: unknown, ctx: GraphQLContext) =>
        parent.totalAmount ?? (await statsFor(c, ctx, parent.id)).totalAmount,
    },
  };
}

async function statsFor(c: Container, ctx: GraphQLContext, categoryId: string) {
  const categories = await c.listCategories.execute(requireUser(ctx));
  const category = categories.find((cat) => cat.id === categoryId);
  return {
    transactionsCount: category?.transactionsCount ?? 0,
    totalAmount: (category?.totalAmountInCents ?? 0) / 100,
  };
}
