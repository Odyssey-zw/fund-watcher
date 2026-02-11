/**
 * Store 类型定义
 */

import type { FundPosition, FundSearchResult } from "~/types/fund";

/**
 * 用户持仓状态
 */
export interface PositionState {
  /** 持仓列表 */
  positions: FundPosition[];
  /** 添加持仓 */
  addPosition: (position: FundPosition) => void;
  /** 更新持仓 */
  updatePosition: (fundCode: string, position: Partial<FundPosition>) => void;
  /** 删除持仓 */
  removePosition: (fundCode: string) => void;
  /** 清空所有持仓 */
  clearPositions: () => void;
  /** 批量设置持仓 */
  setPositions: (positions: FundPosition[]) => void;
  /** 根据基金代码获取持仓 */
  getPosition: (fundCode: string) => FundPosition | undefined;
}

/**
 * 应用全局状态
 */
export interface AppState {
  /** 当前选中的 tab */
  currentTab: number;
  /** 设置当前 tab */
  setCurrentTab: (tab: number) => void;
  /** 是否显示底部导航栏 */
  showTabBar: boolean;
  /** 设置是否显示底部导航栏 */
  setShowTabBar: (show: boolean) => void;
  /** 应用主题 */
  theme: "light" | "dark";
  /** 设置主题 */
  setTheme: (theme: "light" | "dark") => void;
  /** 是否首次启动 */
  isFirstLaunch: boolean;
  /** 设置首次启动状态 */
  setIsFirstLaunch: (isFirst: boolean) => void;
}

/**
 * 基金数据状态
 */
export interface FundState {
  /** 自选基金列表 */
  favorites: FundSearchResult[];
  /** 添加自选 */
  addFavorite: (fund: FundSearchResult) => void;
  /** 删除自选 */
  removeFavorite: (fundCode: string) => void;
  /** 批量设置自选 */
  setFavorites: (funds: FundSearchResult[]) => void;
  /** 检查是否已自选 */
  isFavorite: (fundCode: string) => boolean;
  /** 搜索历史 */
  searchHistory: string[];
  /** 添加搜索历史 */
  addSearchHistory: (keyword: string) => void;
  /** 清空搜索历史 */
  clearSearchHistory: () => void;
  /** 删除单条搜索历史 */
  removeSearchHistory: (keyword: string) => void;
}
