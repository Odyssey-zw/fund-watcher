/**
 * Store 类型定义
 */

import type { FundPosition, FundSearchResult } from "~/types/fund";

/**
 * 持仓汇总信息
 */
export interface PositionSummary {
  /** 总资产 */
  totalAssets: number;
  /** 总收益 */
  totalProfit: number;
  /** 总收益率 */
  totalProfitRate: number;
  /** 总成本 */
  totalCost: number;
  /** 持仓数量 */
  positionCount: number;
}

/**
 * 用户持仓状态
 */
export interface PositionState {
  /** 持仓列表 */
  positions: FundPosition[];
  /** 持仓汇总 */
  summary: PositionSummary;
  /** 加载状态 */
  loading: boolean;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
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
  /** 设置汇总信息 */
  setSummary: (summary: PositionSummary) => void;
  /** 根据基金代码获取持仓 */
  getPosition: (fundCode: string) => FundPosition | undefined;
  /** 从 API 加载持仓数据 */
  loadPositions: () => Promise<void>;
  /** 从 API 加载汇总数据 */
  loadSummary: () => Promise<void>;
  /** 加载所有数据 */
  loadAllData: () => Promise<void>;
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
 * 基金实时数据
 */
export interface FundRealTimeData {
  /** 基金代码 */
  code: string;
  /** 基金名称 */
  name: string;
  /** 当前净值 */
  currentValue: number;
  /** 估算净值 */
  estimateValue?: number;
  /** 估算涨跌幅 */
  estimateChange?: number;
  /** 日涨跌幅 */
  dayGrowthRate?: number;
  /** 更新时间戳 */
  updateTime: number;
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
  /** 基金实时数据缓存 (fundCode -> FundRealTimeData) */
  realTimeDataCache: Record<string, FundRealTimeData>;
  /** 获取基金实时数据 (从缓存或API) */
  getFundRealTimeData: (fundCode: string, forceRefresh?: boolean) => Promise<FundRealTimeData | null>;
  /** 批量获取基金实时数据 */
  batchGetFundRealTimeData: (fundCodes: string[], forceRefresh?: boolean) => Promise<Record<string, FundRealTimeData>>;
  /** 设置基金实时数据到缓存 */
  setFundRealTimeData: (fundCode: string, data: FundRealTimeData) => void;
  /** 清空实时数据缓存 */
  clearRealTimeDataCache: () => void;
}
