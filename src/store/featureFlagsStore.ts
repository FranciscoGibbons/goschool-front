import { create } from "zustand";
import axios from "axios";

interface FeatureFlag {
  id: number;
  feature: string;
  is_enabled: boolean;
}

interface FeatureFlagsState {
  flags: FeatureFlag[];
  isLoading: boolean;
  lastFetch: number | null;
  fetchFlags: () => Promise<void>;
  isEnabled: (feature: string) => boolean;
}

// Cache for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

const featureFlagsStore = create<FeatureFlagsState>()((set, get) => ({
  flags: [],
  isLoading: false,
  lastFetch: null,

  fetchFlags: async () => {
    const state = get();

    // Use cached result if recent
    if (state.lastFetch && Date.now() - state.lastFetch < CACHE_DURATION && state.flags.length > 0) {
      return;
    }

    if (state.isLoading) return;

    set({ isLoading: true });
    try {
      const res = await axios.get("/api/proxy/feature-flags", {
        withCredentials: true,
        timeout: 10000,
      });

      const data = Array.isArray(res.data) ? res.data : [];
      set({ flags: data, lastFetch: Date.now() });
    } catch {
      // Silently fail - features default to enabled
    } finally {
      set({ isLoading: false });
    }
  },

  isEnabled: (feature: string) => {
    const { flags } = get();
    // If no flags loaded yet, default to showing everything
    if (flags.length === 0) return true;
    const flag = flags.find((f) => f.feature === feature);
    // If flag not found, default to enabled
    return flag?.is_enabled ?? true;
  },
}));

export default featureFlagsStore;
