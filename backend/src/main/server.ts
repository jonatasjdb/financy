import { env } from "../config/env";
import { buildContainer } from "./container";
import { buildApp } from "./app";

async function main() {
  const { app } = await buildApp(buildContainer());
  app.listen(env.PORT, () => {
    console.log(`🚀 API GraphQL rodando em http://localhost:${env.PORT}/graphql`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
