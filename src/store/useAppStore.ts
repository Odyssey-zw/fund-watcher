import type { AppState } from "./types";
/**
 * 应用全局状态管理
 */
import { create } from "zustand";
import { createTaroPersist } from "./middleware/persist";

export const useAppStore = create<AppState>(
  createTaroPersist(
    set => ({
      activeTabKey: "home",
      showTabBar: true,
      theme: "light",
      isFirstLaunch: true,

      setActiveTabKey: tab => {
        set({ activeTabKey: tab });
      },

      setShowTabBar: show => {
        set({ showTabBar: show });
      },

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
        activeTabKey: state.activeTabKey,
        theme: state.theme,
        isFirstLaunch: state.isFirstLaunch,
        showTabBar: state.showTabBar,
      }),
    },
  ),
);
