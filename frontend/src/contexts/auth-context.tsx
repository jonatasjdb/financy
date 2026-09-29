import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { ME } from "@/graphql/auth";
import type { User } from "@/graphql/types";
import { authStorage } from "@/lib/auth-storage";
import { onUnauthorized } from "@/lib/apollo";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn(token: string, user: User, remember?: boolean): void;
  signOut(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const [token, setToken] = useState(() => authStorage.getToken());
  const { data, loading } = useQuery(ME, { skip: !token, fetchPolicy: "cache-first" });

  const signOut = useCallback(() => {
    authStorage.clear();
    setToken(null);
    void client.clearStore();
  }, [client]);

  const signIn = useCallback(
    (newToken: string, user: User, remember = true) => {
      authStorage.setToken(newToken, remember);
      client.writeQuery({ query: ME, data: { me: user } });
      setToken(newToken);
    },
    [client],
  );

  useEffect(() => onUnauthorized(signOut), [signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: token ? (data?.me ?? null) : null,
      isAuthenticated: !!token,
      isLoading: !!token && loading && !data,
      signIn,
      signOut,
    }),
    [token, data, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
