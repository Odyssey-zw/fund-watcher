import type { FundState } from "./types";
/**
 * 基金数据状态管理
 */
import { create } from "zustand";
import { createTaroPersist } from "./middleware/persist";

const MAX_SEARCH_HISTORY = 20; // 最多保存20条搜索历史

export const useFundStore = create<FundState>(
  createTaroPersist(
    (set, get) => ({
      favorites: [],
      searchHistory: [],

      addFavorite: fund => {
        set(state => {
          const exists = state.favorites.some(f => f.code === fund.code);
          if (exists) {
            console.warn(`Fund ${fund.code} is already in favorites`);
            return state;
          }
          return {
            favorites: [...state.favorites, fund],
          };
        });
      },

      removeFavorite: fundCode => {
        set(state => ({
          favorites: state.favorites.filter(f => f.code !== fundCode),
        }));
      },

      setFavorites: funds => {
        set({ favorites: funds });
      },

      isFavorite: fundCode => {
        return get().favorites.some(f => f.code === fundCode);
      },

      addSearchHistory: keyword => {
        set(state => {
          // 去除空白字符
          const trimmedKeyword = keyword.trim();
          if (!trimmedKeyword) {
            return state;
          }

          // 如果已存在,先移除旧的
          const filtered = state.searchHistory.filter(k => k !== trimmedKeyword);

          // 添加到开头,保持最新的在前面
          const newHistory = [trimmedKeyword, ...filtered].slice(0, MAX_SEARCH_HISTORY);

          return {
            searchHistory: newHistory,
          };
        });
      },

      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },

      removeSearchHistory: keyword => {
        set(state => ({
          searchHistory: state.searchHistory.filter(k => k !== keyword),
        }));
      },
    }),
    {
      name: "fund-watcher-funds",
      partialize: state => ({
        favorites: state.favorites,
        searchHistory: state.searchHistory,
      }),
    },
  ),
);
