import { create } from "zustand";
import type { Document } from "../../types/Document";
import { host } from "../shared/Config";

interface DashboardState {
  documents: Document[];
  pendingDocuments: Document[];
  loading: boolean;
  error: string;
  isActivitySidebarOpen: boolean;
  setDocuments: (documents: Document[]) => void;
  setPendingDocuments: (documents: Document[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setActivitySidebarOpen: (isOpen: boolean) => void;
  toggleActivitySidebar: () => void;
  fetchDocuments: () => Promise<void>;
  fetchPendingDocuments: () => Promise<void>;
}

export const useDashboardService = create<DashboardState>((set) => ({
  documents: [],
  pendingDocuments: [],
  loading: false,
  error: "",
  isActivitySidebarOpen: false,

  setDocuments: (documents: Document[]) => set({ documents }),

  setPendingDocuments: (documents: Document[]) =>
    set({ pendingDocuments: documents }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string) => set({ error }),

  setActivitySidebarOpen: (isOpen: boolean) =>
    set({ isActivitySidebarOpen: isOpen }),

  toggleActivitySidebar: () =>
    set((state) => ({ isActivitySidebarOpen: !state.isActivitySidebarOpen })),

  fetchDocuments: async () => {
    set({ loading: true, error: "" });
    try {
      const response = await fetch(`${host}/documents`);
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data = await response.json();
      set({ documents: data || [], loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
      });
    }
  },

  fetchPendingDocuments: async () => {
    set({ loading: true, error: "" });
    try {
      const response = await fetch(`${host}/documents?status=pending`);
      if (!response.ok) {
        throw new Error("Failed to fetch pending documents");
      }
      const data = await response.json();
      set({ pendingDocuments: data || [], loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
      });
    }
  },
}));
