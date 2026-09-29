# Financy 💰

Aplicação de gestão de finanças pessoais: cada usuário cria sua conta e gerencia **suas próprias** transações e categorias.

| Pasta | Conteúdo |
| --- | --- |
| [`backend/`](./backend) | API **GraphQL** em **TypeScript** + **Prisma** + **SQLite**, organizada em Clean Architecture |
| [`frontend/`](./frontend) | SPA **React** + **Vite** + **Apollo Client (GraphQL)** + TailwindCSS, fiel ao layout do Figma |

---

## ▶️ Como rodar (máquina local)

**Pré-requisito:** Node.js **20.19+** (recomendado 22 LTS) e npm.

```bash
# 1. Na raiz do projeto: instala tudo, cria os .env, cria o banco SQLite e popula com dados de exemplo
npm run setup

# 2. Sobe API + front-end juntos
npm run dev
```

- Front-end: **http://localhost:5173**
- API GraphQL (com Apollo Sandbox para testar queries): **http://localhost:4000/graphql**

**Usuário de demonstração** (criado pelo seed):

```
E-mail: conta@teste.com
Senha:  12345678
```

Ou crie uma conta nova na tela de cadastro.

<details>
<summary>Rodando cada parte manualmente</summary>

```bash
# API
cd backend
cp .env.example .env
npm install          # também executa `prisma generate`
npm run setup        # prisma migrate deploy + seed
npm run dev          # http://localhost:4000/graphql

# Front-end (em outro terminal)
cd frontend
cp .env.example .env
npm install
npm run dev          # http://localhost:5173
```
</details>

---

## ✅ Requisitos atendidos

| Requisito | Back-end | Front-end |
| --- | :-: | :-: |
| Criar conta e fazer login (JWT) | ✅ | ✅ |
| Usuário vê e gerencia apenas seus dados | ✅ | ✅ |
| Criar / editar / deletar / listar transações | ✅ | ✅ |
| Criar / editar / deletar / listar categorias | ✅ | ✅ |
| TypeScript, GraphQL, Prisma, SQLite, CORS | ✅ | — |
| React + Vite (sem framework) + GraphQL | — | ✅ |
| `.env.example` com as variáveis | ✅ `JWT_SECRET`, `DATABASE_URL` | ✅ `VITE_BACKEND_URL` |
| Layout do Figma (6 páginas + 2 modais) | — | ✅ |

**Páginas:** `/` (login se deslogado · dashboard se logado), `/cadastro`, `/transacoes`, `/categorias`, `/perfil` + modais de transação e categoria.

---

## 🏛️ Arquitetura do back-end

```
backend/src
├── domain/              # Regras de negócio puras (sem dependências externas)
│   ├── entities/        # User, Category, Transaction
│   ├── repositories/    # Contratos (interfaces) de persistência
│   └── errors/          # Erros de domínio (NOT_FOUND, CONFLICT, ...)
├── application/         # Casos de uso — orquestram o domínio
│   ├── use-cases/       # auth, user, categories, transactions (validação com Zod)
│   └── providers/       # Contratos de hash e token
├── infra/               # Detalhes: frameworks e drivers
│   ├── database/prisma/ # PrismaClient + implementações dos repositórios
│   ├── providers/       # bcrypt, jsonwebtoken
│   └── graphql/         # typeDefs, resolvers (controllers finos), presenters, contexto
└── main/                # Composition root (injeção de dependências) + servidor Express/Apollo
```

- **Regra de dependência:** `domain` ← `application` ← `infra`/`main`. Casos de uso dependem de interfaces, nunca do Prisma.
- **Isolamento por usuário:** todo caso de uso recebe o `userId` do token e verifica a posse do recurso; recursos de outro usuário são tratados como inexistentes.
- **Valores em centavos** no banco (`amountInCents`) para evitar erros de ponto flutuante; a API expõe `amount` em reais.
- **Regra de negócio:** não é possível excluir uma categoria que ainda possui transações.
- **Testes:** `npm test` roda os testes dos casos de uso com repositórios em memória (Vitest).

### Schema GraphQL (resumo)

```graphql
type Query {
  me: User!
  categories: [Category!]!
  transactions(filter: TransactionFilterInput): [Transaction!]!
  summary(month: Int!, year: Int!): Summary!
}

type Mutation {
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  updateProfile(input: UpdateProfileInput!): User!
  createCategory(input: CategoryInput!): Category!
  updateCategory(id: ID!, input: CategoryInput!): Category!
  deleteCategory(id: ID!): Boolean!
  createTransaction(input: TransactionInput!): Transaction!
  updateTransaction(id: ID!, input: TransactionInput!): Transaction!
  deleteTransaction(id: ID!): Boolean!
}
```

Requisições autenticadas enviam o header `Authorization: Bearer <token>`.

---

## 🎨 Front-end

- **Apollo Client** para queries/mutations GraphQL (documentos tipados com `TypedDocumentNode`).
- **React Hook Form + Zod** nos formulários; **Radix Dialog** nos modais; **Sonner** para feedback.
- **TailwindCSS v4** com os tokens do Style Guide do Figma (`src/index.css`); ícones **Lucide** (mesma biblioteca do Figma).
- "Lembrar-me" no login guarda o token no `localStorage` (senão, `sessionStorage`); token expirado desloga automaticamente.

## 🧰 Scripts úteis

| Onde | Script | O que faz |
| --- | --- | --- |
| raiz | `npm run setup` | Instala tudo, cria `.env`, migra e popula o banco |
| raiz | `npm run dev` | Sobe API e front-end juntos |
| backend | `npm test` | Testes dos casos de uso |
| backend | `npm run db:reset` | Recria o banco e roda o seed novamente |
| frontend | `npm run build` | Build de produção |
