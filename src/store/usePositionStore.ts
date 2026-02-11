import type { PositionState } from "./types";
/**
 * 用户持仓状态管理
 */
import { create } from "zustand";
import { getPositions, getPositionSummary } from "~/api/position";

export const usePositionStore = create<PositionState>((set, get) => ({
  positions: [],
  summary: {
    totalAssets: 0,
    totalProfit: 0,
    totalProfitRate: 0,
    totalCost: 0,
    positionCount: 0,
  },
  loading: false,

  setLoading: loading => {
    set({ loading });
  },

  addPosition: position => {
    set(state => {
      // 检查是否已存在该基金
      const exists = state.positions.some(p => p.fundCode === position.fundCode);
      if (exists) {
        console.warn(`Position for fund ${position.fundCode} already exists`);
        return state;
      }
      return {
        positions: [...state.positions, position],
      };
    });
  },

  updatePosition: (fundCode, updates) => {
    set(state => ({
      positions: state.positions.map(p => (p.fundCode === fundCode ? { ...p, ...updates } : p)),
    }));
  },

  removePosition: fundCode => {
    set(state => ({
      positions: state.positions.filter(p => p.fundCode !== fundCode),
    }));
  },

  clearPositions: () => {
    set({ positions: [] });
  },

  setPositions: positions => {
    set({ positions });
  },

  setSummary: summary => {
    set({ summary });
  },

  getPosition: fundCode => {
    return get().positions.find(p => p.fundCode === fundCode);
  },

  loadPositions: async () => {
    try {
      const response = await getPositions();
      if (response.success) {
        set({ positions: response.data });
      }
    } catch (error) {
      console.error("加载持仓数据失败:", error);
      throw error;
    }
  },

  loadSummary: async () => {
    try {
      const response = await getPositionSummary();
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
      await Promise.all([get().loadPositions(), get().loadSummary()]);
    } catch (error) {
      console.error("加载数据失败:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
