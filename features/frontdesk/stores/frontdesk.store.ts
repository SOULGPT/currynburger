import { create } from 'zustand';

interface FrontDeskStore {
  selectedOrderId: string | null;
  selectOrder: (orderId: string | null) => void;

  // Filter options
  showPaidToday: boolean;
  toggleShowPaidToday: () => void;

  // Financial display
  showFinancialTicker: boolean;
  toggleFinancialTicker: () => void;
}

export const useFrontDeskStore = create<FrontDeskStore>((set) => ({
  selectedOrderId: null,
  selectOrder: (orderId) => set({ selectedOrderId: orderId }),

  showPaidToday: false,
  toggleShowPaidToday: () => set((state) => ({ showPaidToday: !state.showPaidToday })),

  showFinancialTicker: true,
  toggleFinancialTicker: () => set((state) => ({ showFinancialTicker: !state.showFinancialTicker })),
}));