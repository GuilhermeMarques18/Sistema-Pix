export const TOKEN_KEY = 'sistem_pix:token';
export const SESSION_CHANGED_EVENT = 'auth:session-changed';

function notifySessionChanged() {
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export const tokenService = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    notifySessionChanged();
  },

  remove(): void {
    localStorage.removeItem(TOKEN_KEY);
    notifySessionChanged();
  },

  exists(): boolean {
    return !!tokenService.get();
  },
};
