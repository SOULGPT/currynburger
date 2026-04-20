import { create } from 'zustand';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  topItems: Array<{ name: string; count: number; revenue: number }>;
  hourlyStats: Array<{ hour: number; orders: number; revenue: number }>;
  dailyStats: Array<{ date: string; orders: number; revenue: number }>;
}

interface AdminStore {
  selectedTimeRange: 'today' | 'week' | 'month';
  setTimeRange: (range: 'today' | 'week' | 'month') => void;

  stats: DashboardStats | null;
  setStats: (stats: DashboardStats) => void;

  loading: boolean;
  setLoading: (loading: boolean) => void;

  // Menu management
  showMenuManager: boolean;
  toggleMenuManager: () => void;

  // User management
  showUserManager: boolean;
  toggleUserManager: () => void;

  // Table management
  showTableManager: boolean;
  toggleTableManager: () => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  selectedTimeRange: 'today',
  setTimeRange: (range) => set({ selectedTimeRange: range }),

  stats: null,
  setStats: (stats) => set({ stats }),

  loading: true,
  setLoading: (loading) => set({ loading }),

  showMenuManager: false,
  toggleMenuManager: () => set((state) => ({ showMenuManager: !state.showMenuManager })),

  showUserManager: false,
  toggleUserManager: () => set((state) => ({ showUserManager: !state.showUserManager })),

  showTableManager: false,
  toggleTableManager: () => set((state) => ({ showTableManager: !state.showTableManager })),
}));