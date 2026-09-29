import { gql, type TypedDocumentNode } from "@apollo/client";
import type { Summary, Transaction, TransactionFilter, TransactionInput } from "./types";

const TRANSACTION_FIELDS = gql`
  fragment TransactionFields on Transaction {
    id
    description
    amount
    type
    date
    category {
      id
      title
      icon
      color
    }
  }
`;

export const TRANSACTIONS: TypedDocumentNode<
  { transactions: Transaction[] },
  { filter?: TransactionFilter }
> = gql`
  query Transactions($filter: TransactionFilterInput) {
    transactions(filter: $filter) {
      ...TransactionFields
    }
  }
  ${TRANSACTION_FIELDS}
`;

export const SUMMARY: TypedDocumentNode<{ summary: Summary }, { month: number; year: number }> = gql`
  query Summary($month: Int!, $year: Int!) {
    summary(month: $month, year: $year) {
      balance
      monthIncome
      monthExpense
    }
  }
`;

export const CREATE_TRANSACTION: TypedDocumentNode<
  { createTransaction: Transaction },
  { input: TransactionInput }
> = gql`
  mutation CreateTransaction($input: TransactionInput!) {
    createTransaction(input: $input) {
      ...TransactionFields
    }
  }
  ${TRANSACTION_FIELDS}
`;

export const UPDATE_TRANSACTION: TypedDocumentNode<
  { updateTransaction: Transaction },
  { id: string; input: TransactionInput }
> = gql`
  mutation UpdateTransaction($id: ID!, $input: TransactionInput!) {
    updateTransaction(id: $id, input: $input) {
      ...TransactionFields
    }
  }
  ${TRANSACTION_FIELDS}
`;

export const DELETE_TRANSACTION: TypedDocumentNode<{ deleteTransaction: boolean }, { id: string }> =
  gql`
    mutation DeleteTransaction($id: ID!) {
      deleteTransaction(id: $id)
    }
  `;

/** Queries que dependem de transações/categorias e devem ser recarregadas após mutations. */
export const FINANCE_QUERIES = ["Transactions", "Categories", "Summary"];
