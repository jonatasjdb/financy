import { gql, type TypedDocumentNode } from "@apollo/client";
import type { Category, CategoryInput } from "./types";

const CATEGORY_FIELDS = gql`
  fragment CategoryFields on Category {
    id
    title
    description
    icon
    color
    transactionsCount
    totalAmount
  }
`;

export const CATEGORIES: TypedDocumentNode<{ categories: Category[] }> = gql`
  query Categories {
    categories {
      ...CategoryFields
    }
  }
  ${CATEGORY_FIELDS}
`;

export const CREATE_CATEGORY: TypedDocumentNode<
  { createCategory: Category },
  { input: CategoryInput }
> = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      ...CategoryFields
    }
  }
  ${CATEGORY_FIELDS}
`;

export const UPDATE_CATEGORY: TypedDocumentNode<
  { updateCategory: Category },
  { id: string; input: CategoryInput }
> = gql`
  mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
    updateCategory(id: $id, input: $input) {
      ...CategoryFields
    }
  }
  ${CATEGORY_FIELDS}
`;

export const DELETE_CATEGORY: TypedDocumentNode<{ deleteCategory: boolean }, { id: string }> = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;
