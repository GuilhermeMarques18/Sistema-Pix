const TOKEN_KEY = 'sistem_pix:token';

export const tokenService = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  remove(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  exists(): boolean {
    return !!tokenService.get();
  },
};
