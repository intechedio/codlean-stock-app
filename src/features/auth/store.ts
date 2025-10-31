import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  auth: {
    user?: { name: string };
  };
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      auth: { user: undefined },
      async login(username, password) {
        const ok = username === 'admin' && password === '12345';
        if (ok) set((s) => ({ ...s, auth: { user: { name: 'admin' } } }));
        return ok;
      },
      logout() {
        set((s) => ({ ...s, auth: { user: undefined } }));
      },
    }),
    {
      name: 'codlean-stock-app-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ auth: state.auth } as Partial<AuthState>),
    },
  ),
);


