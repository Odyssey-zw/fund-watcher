import type { AppState } from "./types";
/**
 * 应用全局状态管理
 */
import { create } from "zustand";
import { createTaroPersist } from "./middleware/persist";

export const useAppStore = create<AppState>(
  createTaroPersist(
    set => ({
      currentTab: 0,
      showTabBar: true,
      theme: "light",
      isFirstLaunch: true,

      setCurrentTab: tab => {
        set({ currentTab: tab });
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
        currentTab: state.currentTab,
        theme: state.theme,
        isFirstLaunch: state.isFirstLaunch,
        showTabBar: state.showTabBar,
      }),
    },
  ),
);
