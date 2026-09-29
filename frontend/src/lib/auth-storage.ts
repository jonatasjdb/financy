const TOKEN_KEY = "financy:token";

/**
 * "Lembrar-me" marcado -> localStorage (persiste entre sessões do navegador).
 * Desmarcado -> sessionStorage (some ao fechar o navegador).
 */
export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string, remember: boolean) {
    this.clear();
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },
};
