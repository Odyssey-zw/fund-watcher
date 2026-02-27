import type { AppState } from "./types";
/**
 * 应用全局状态管理
 */
import { create } from "zustand";
import { createTaroPersist } from "./middleware/persist";

export const useAppStore = create<AppState>(
  createTaroPersist(
    set => ({
      theme: "light",
      isFirstLaunch: true,

      setTheme: theme => {
        set({ theme });
      },

      setIsFirstLaunch: isFirst => {
        set({ isFirstLaunch: isFirst });
      },
    }),
    {
      name: "fund-watcher-app",
      partialize: state => ({
        theme: state.theme,
        isFirstLaunch: state.isFirstLaunch,
      }),
    },
  ),
);
