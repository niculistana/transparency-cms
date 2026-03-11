import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  currentRole: string | null;
  login: (role: string) => void;
  logout: () => void;
}

export const useAuthService = create<AuthState>((set) => {
  // Check localStorage on initialization
  const storedRole = localStorage.getItem("currentRole");
  const isLoggedIn = !!storedRole;

  return {
    isLoggedIn,
    currentRole: storedRole,
    login: (role: string) => {
      localStorage.setItem("currentRole", role);
      set({ isLoggedIn: true, currentRole: role });
    },
    logout: () => {
      localStorage.removeItem("currentRole");
      set({ isLoggedIn: false, currentRole: null });
    },
  };
});
