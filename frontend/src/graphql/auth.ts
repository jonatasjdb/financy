import { gql, type TypedDocumentNode } from "@apollo/client";
import type { User } from "./types";

const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    name
    email
  }
`;

interface AuthPayload {
  token: string;
  user: User;
}

export const LOGIN: TypedDocumentNode<
  { login: AuthPayload },
  { input: { email: string; password: string } }
> = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

export const REGISTER: TypedDocumentNode<
  { register: AuthPayload },
  { input: { name: string; email: string; password: string } }
> = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

export const ME: TypedDocumentNode<{ me: User }> = gql`
  query Me {
    me {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

export const UPDATE_PROFILE: TypedDocumentNode<
  { updateProfile: User },
  { input: { name: string } }
> = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;
