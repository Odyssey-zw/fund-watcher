import type { FundRealTimeData, FundState } from "./types";
/**
 * 基金数据状态管理
 */
import { create } from "zustand";
import { getSinaFundData } from "~/api/fund-internal";
import { createTaroPersist } from "./middleware/persist";

const MAX_SEARCH_HISTORY = 20; // 最多保存20条搜索历史
const CACHE_EXPIRE_TIME = 30_000; // 缓存过期时间: 30秒

export const useFundStore = create<FundState>(
  createTaroPersist(
    (set, get) => ({
      favorites: [],
      searchHistory: [],
      realTimeDataCache: {},

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

      getFundRealTimeData: async (fundCode, forceRefresh = false) => {
        const cache = get().realTimeDataCache[fundCode];
        const now = Date.now();

        // 如果缓存存在且未过期,直接返回缓存
        if (!forceRefresh && cache && now - cache.updateTime < CACHE_EXPIRE_TIME) {
          return cache;
        }

        // 从API获取最新数据
        try {
          const fundData = await getSinaFundData(fundCode);
          if (fundData && fundData.name) {
            const realTimeData: FundRealTimeData = {
              code: fundCode,
              name: fundData.name,
              currentValue: Number.parseFloat(fundData.gsz || "0") || 0,
              estimateValue: fundData.gsz ? Number.parseFloat(fundData.gsz) : undefined,
              estimateChange: fundData.gszzl ? Number.parseFloat(fundData.gszzl) / 100 : undefined,
              dayGrowthRate: fundData.gszzl ? Number.parseFloat(fundData.gszzl) / 100 : undefined,
              updateTime: now,
            };

            // 更新缓存
            set(state => ({
              realTimeDataCache: {
                ...state.realTimeDataCache,
                [fundCode]: realTimeData,
              },
            }));

            return realTimeData;
          }
          return null;
        } catch (error) {
          console.error(`获取基金 ${fundCode} 实时数据失败:`, error);
          // 如果API调用失败但有缓存,返回缓存数据
          return cache || null;
        }
      },

      batchGetFundRealTimeData: async (fundCodes, forceRefresh = false) => {
        const results: Record<string, FundRealTimeData> = {};

        // 并行获取所有基金数据
        await Promise.all(
          fundCodes.map(async code => {
            const data = await get().getFundRealTimeData(code, forceRefresh);
            if (data) {
              results[code] = data;
            }
          }),
        );

        return results;
      },

      setFundRealTimeData: (fundCode, data) => {
        set(state => ({
          realTimeDataCache: {
            ...state.realTimeDataCache,
            [fundCode]: data,
          },
        }));
      },

      clearRealTimeDataCache: () => {
        set({ realTimeDataCache: {} });
      },
    }),
    {
      name: "fund-watcher-funds",
      partialize: state => ({
        favorites: state.favorites,
        searchHistory: state.searchHistory,
        // 不持久化 realTimeDataCache,每次启动重新加载
      }),
    },
  ),
);
