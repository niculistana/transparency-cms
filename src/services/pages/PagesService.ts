import { create } from "zustand";
import type { Page } from "../../types/Page";
import { host } from "../shared/Config";

interface PagesState {
  pages: Page[];
  currentPage: Page | null;
  loading: boolean;
  error: string;
  setPages: (pages: Page[]) => void;
  setCurrentPage: (page: Page | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  fetchPages: () => Promise<void>;
  fetchPageById: (id: string) => Promise<void>;
}

export const usePagesService = create<PagesState>((set) => ({
  pages: [],
  currentPage: null,
  loading: false,
  error: "",

  setPages: (pages: Page[]) => set({ pages }),

  setCurrentPage: (page: Page | null) => set({ currentPage: page }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string) => set({ error }),

  fetchPages: async () => {
    set({ loading: true, error: "" });
    try {
      const response = await fetch(`${host}/pages`);
      if (!response.ok) {
        throw new Error("Failed to fetch pages");
      }
      const data = await response.json();
      set({ pages: data || [], loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
      });
    }
  },

  fetchPageById: async (id: string) => {
    set({ loading: true, error: "", currentPage: null });
    try {
      const response = await fetch(`${host}/pages/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch page");
      }
      const data = await response.json();
      set({ currentPage: data, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
        currentPage: null,
      });
    }
  },
}));
