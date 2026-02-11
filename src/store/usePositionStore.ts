import type { PositionState } from "./types";
/**
 * 用户持仓状态管理
 */
import { create } from "zustand";
import { createTaroPersist } from "./middleware/persist";

export const usePositionStore = create<PositionState>(
  createTaroPersist(
    (set, get) => ({
      positions: [],

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

      getPosition: fundCode => {
        return get().positions.find(p => p.fundCode === fundCode);
      },
    }),
    {
      name: "fund-watcher-positions",
      // 仅持久化 positions 数组,方法不需要持久化
      partialize: state => ({ positions: state.positions }),
    },
  ),
);
