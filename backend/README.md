# Financy — Back-end

API GraphQL (Apollo Server + Express) em TypeScript, com Prisma e SQLite, organizada em Clean Architecture.

```bash
cp .env.example .env
npm install      # executa prisma generate
npm run setup    # aplica as migrations e popula o banco (conta@teste.com / 12345678)
npm run dev      # http://localhost:4000/graphql
npm test         # testes dos casos de uso
```

Veja o [README principal](../README.md) para detalhes da arquitetura e do schema.
