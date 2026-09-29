import gql from "graphql-tag";

export const typeDefs = gql`
  enum TransactionType {
    INCOME
    EXPENSE
  }

  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Category {
    id: ID!
    title: String!
    description: String
    "Chave do ícone (ex.: utensils, car-front)"
    icon: String!
    "Chave da cor (green, blue, purple, pink, red, orange, yellow)"
    color: String!
    transactionsCount: Int!
    "Soma dos valores das transações da categoria, em reais"
    totalAmount: Float!
    createdAt: String!
  }

  type Transaction {
    id: ID!
    description: String!
    "Valor positivo em reais; o sinal é dado por type"
    amount: Float!
    type: TransactionType!
    "Data ISO 8601"
    date: String!
    categoryId: ID!
    category: Category!
    createdAt: String!
  }

  type Summary {
    balance: Float!
    monthIncome: Float!
    monthExpense: Float!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    name: String!
  }

  input CategoryInput {
    title: String!
    description: String
    icon: String!
    color: String!
  }

  input TransactionInput {
    description: String!
    amount: Float!
    type: TransactionType!
    "Data no formato YYYY-MM-DD"
    date: String!
    categoryId: ID!
  }

  input TransactionFilterInput {
    search: String
    type: TransactionType
    categoryId: ID
    month: Int
    year: Int
  }

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
`;
