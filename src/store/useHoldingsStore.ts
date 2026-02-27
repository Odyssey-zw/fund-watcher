import type { HoldingsState } from "./types";
/**
 * 用户持仓状态管理
 */
import { create } from "zustand";
import { getHoldings, getHoldingsSummary } from "~/api/holdings";

export const useHoldingsStore = create<HoldingsState>((set, get) => ({
  holdings: [],
  summary: {
    totalAssets: 0,
    totalProfit: 0,
    totalProfitRate: 0,
    totalCost: 0,
    holdingsCount: 0,
  },
  loading: false,

  setLoading: loading => {
    set({ loading });
  },

  addHolding: holding => {
    set(state => {
      // 检查是否已存在该基金
      const exists = state.holdings.some(p => p.fundCode === holding.fundCode);
      if (exists) {
        console.warn(`Holding for fund ${holding.fundCode} already exists`);
        return state;
      }
      return {
        holdings: [...state.holdings, holding],
      };
    });
  },

  updateHolding: (fundCode, updates) => {
    set(state => ({
      holdings: state.holdings.map(p => (p.fundCode === fundCode ? { ...p, ...updates } : p)),
    }));
  },

  removeHolding: fundCode => {
    set(state => ({
      holdings: state.holdings.filter(p => p.fundCode !== fundCode),
    }));
  },

  clearHoldings: () => {
    set({ holdings: [] });
  },

  setHoldings: holdings => {
    set({ holdings });
  },

  setSummary: summary => {
    set({ summary });
  },

  getHolding: fundCode => {
    return get().holdings.find(p => p.fundCode === fundCode);
  },

  loadHoldings: async () => {
    try {
      const response = await getHoldings();
      if (response.success) {
        set({ holdings: response.data });
      }
    } catch (error) {
      console.error("加载持仓数据失败:", error);
      throw error;
    }
  },

  loadSummary: async () => {
    try {
      const response = await getHoldingsSummary();
      if (response.success) {
        set({ summary: response.data });
      }
    } catch (error) {
      console.error("加载汇总数据失败:", error);
      throw error;
    }
  },

  loadAllData: async () => {
    set({ loading: true });
    try {
      await Promise.all([get().loadHoldings(), get().loadSummary()]);
    } catch (error) {
      console.error("加载数据失败:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
