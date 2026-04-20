import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface KitchenOrderState {
  selectedOrderId: string | null;
  sortBy: 'wait_time' | 'urgency' | 'order_type';
  filterSource: 'all' | 'app' | 'waiter' | 'desk';
  isPaused: boolean;

  // Actions
  selectOrder: (orderId: string | null) => void;
  setSortBy: (sort: 'wait_time' | 'urgency' | 'order_type') => void;
  setFilterSource: (source: 'all' | 'app' | 'waiter' | 'desk') => void;
  togglePause: () => void;
}

export const useKitchenStore = create<KitchenOrderState>()(
  persist(
    (set) => ({
      selectedOrderId: null,
      sortBy: 'wait_time',
      filterSource: 'all',
      isPaused: false,

      selectOrder: (orderId) => set({ selectedOrderId: orderId }),

      setSortBy: (sort) => set({ sortBy: sort }),

      setFilterSource: (source) => set({ filterSource: source }),

      togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
    }),
    {
      name: 'kitchen-store',
      // Only persist user preferences, not selected order
      partialize: (state) => ({
        sortBy: state.sortBy,
        filterSource: state.filterSource,
        isPaused: state.isPaused,
      }),
    }
  )
);
