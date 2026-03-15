import { create } from "zustand";
import type { Activity } from "../../types/Activity";
import { host } from "../shared/Config";

interface ActivityState {
  activities: Activity[];
  loading: boolean;
  error: string;
  setActivities: (activities: Activity[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  fetchActivities: () => Promise<void>;
  dismissActivity: (activityId: number) => Promise<void>;
}

export const useActivityService = create<ActivityState>((set) => ({
  activities: [],
  loading: false,
  error: "",

  setActivities: (activities: Activity[]) => set({ activities }),

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string) => set({ error }),

  fetchActivities: async () => {
    set({ loading: true, error: "" });
    try {
      const response = await fetch(`${host}/activities`);
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      const data = await response.json();
      set({ activities: data || [], loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
      });
    }
  },

  dismissActivity: async (activityId: number) => {
    try {
      const response = await fetch(`${host}/activities/${activityId}/dismiss`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to dismiss activity");
      }
      // Remove the dismissed activity from the state
      set((state) => ({
        activities: state.activities.filter(
          (activity) => activity.activity_id !== activityId,
        ),
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
}));
