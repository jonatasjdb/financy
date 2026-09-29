import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { env } from "../config/env";
import { typeDefs } from "../infra/graphql/type-defs";
import { buildResolvers } from "../infra/graphql/resolvers";
import { buildContext, type GraphQLContext } from "../infra/graphql/context";
import { formatError } from "../infra/graphql/format-error";
import type { Container } from "./container";

export async function buildApp(container: Container) {
  const apollo = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers: buildResolvers(container),
    formatError,
    introspection: true,
  });
  await apollo.start();

  const app = express();
  const origins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
  app.use(cors({ origin: origins.includes("*") ? true : origins }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(apollo, {
      context: async ({ req }) => buildContext(container.tokens, req.headers.authorization),
    }),
  );

  return { app, apollo };
}
