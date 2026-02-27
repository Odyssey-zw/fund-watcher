/**
 * 持仓（Holdings）相关 API
 */

import type { ApiResponse } from "~/types/common";
import type { FundPosition } from "~/types/fund";
import Taro from "@tarojs/taro";
import { useFundStore } from "~/store/useFundStore";

const STORAGE_KEY = "fund_holdings";

/**
 * 获取用户持仓列表
 */
export async function getHoldings(): Promise<ApiResponse<FundPosition[]>> {
  try {
    const storedData = Taro.getStorageSync(STORAGE_KEY);
    const holdings: FundPosition[] = storedData || [];

    // 从全局缓存获取基金实时数据
    const fundCodes = holdings.map(h => h.fundCode);
    const fundStore = useFundStore.getState();
    const realTimeDataMap = await fundStore.batchGetFundRealTimeData(fundCodes);

    // 计算收益
    const updatedHoldings = holdings.map(holding => {
      const realTimeData = realTimeDataMap[holding.fundCode];
      if (realTimeData) {
        const currentValue = realTimeData.currentValue;
        const marketValue = holding.shares * currentValue;
        const profit = marketValue - holding.cost;
        const profitRate = holding.cost > 0 ? profit / holding.cost : 0;

        return {
          ...holding,
          currentValue,
          marketValue,
          profit,
          profitRate,
        };
      }
      return holding;
    });

    return {
      code: 200,
      message: "success",
      success: true,
      data: updatedHoldings,
    };
  } catch (error) {
    console.error("获取持仓列表失败:", error);
    return {
      code: 500,
      message: "获取持仓列表失败",
      success: false,
      data: [],
    };
  }
}

/**
 * 添加持仓
 */
export async function addHolding(
  holding: Omit<FundPosition, "currentValue" | "marketValue" | "profit" | "profitRate">,
): Promise<ApiResponse<boolean>> {
  try {
    const storedData = Taro.getStorageSync(STORAGE_KEY);
    const holdings: FundPosition[] = storedData || [];

    // 检查是否已存在相同基金的持仓
    const existingIndex = holdings.findIndex(h => h.fundCode === holding.fundCode);

    if (existingIndex >= 0) {
      // 更新现有持仓（合并份额和成本）
      const existing = holdings[existingIndex];
      const totalShares = existing.shares + holding.shares;
      const totalCost = existing.cost + holding.cost;

      holdings[existingIndex] = {
        ...existing,
        shares: totalShares,
        cost: totalCost,
        buyDate: holding.buyDate, // 使用最新的买入日期
      };
    } else {
      // 添加新持仓
      holdings.push(holding as FundPosition);
    }

    Taro.setStorageSync(STORAGE_KEY, holdings);

    return {
      code: 200,
      message: "success",
      success: true,
      data: true,
    };
  } catch (error) {
    console.error("添加持仓失败:", error);
    return {
      code: 500,
      message: "添加持仓失败",
      success: false,
      data: false,
    };
  }
}

/**
 * 更新持仓
 */
export async function updateHolding(fundCode: string, updates: Partial<FundPosition>): Promise<ApiResponse<boolean>> {
  try {
    const storedData = Taro.getStorageSync(STORAGE_KEY);
    const holdings: FundPosition[] = storedData || [];

    const index = holdings.findIndex(h => h.fundCode === fundCode);
    if (index >= 0) {
      holdings[index] = { ...holdings[index], ...updates };
      Taro.setStorageSync(STORAGE_KEY, holdings);

      return {
        code: 200,
        message: "success",
        success: true,
        data: true,
      };
    }

    return {
      code: 404,
      message: "持仓不存在",
      success: false,
      data: false,
    };
  } catch (error) {
    console.error("更新持仓失败:", error);
    return {
      code: 500,
      message: "更新持仓失败",
      success: false,
      data: false,
    };
  }
}

/**
 * 删除持仓
 */
export async function deleteHolding(fundCode: string): Promise<ApiResponse<boolean>> {
  try {
    const storedData = Taro.getStorageSync(STORAGE_KEY);
    const holdings: FundPosition[] = storedData || [];

    const filteredHoldings = holdings.filter(h => h.fundCode !== fundCode);
    Taro.setStorageSync(STORAGE_KEY, filteredHoldings);

    return {
      code: 200,
      message: "success",
      success: true,
      data: true,
    };
  } catch (error) {
    console.error("删除持仓失败:", error);
    return {
      code: 500,
      message: "删除持仓失败",
      success: false,
      data: false,
    };
  }
}

/**
 * 清空所有持仓
 */
export async function clearAllHoldings(): Promise<ApiResponse<boolean>> {
  try {
    Taro.removeStorageSync(STORAGE_KEY);

    return {
      code: 200,
      message: "success",
      success: true,
      data: true,
    };
  } catch (error) {
    console.error("清空持仓失败:", error);
    return {
      code: 500,
      message: "清空持仓失败",
      success: false,
      data: false,
    };
  }
}

/**
 * 获取持仓统计信息
 */
export async function getHoldingsSummary(): Promise<
  ApiResponse<{
    totalAssets: number;
    totalProfit: number;
    totalProfitRate: number;
    totalCost: number;
    holdingsCount: number;
  }>
> {
  try {
    const response = await getHoldings();
    if (!response.success) {
      throw new Error("获取持仓列表失败");
    }

    const holdings = response.data;
    const totalAssets = holdings.reduce((sum, h) => sum + (h.marketValue || 0), 0);
    const totalCost = holdings.reduce((sum, h) => sum + h.cost, 0);
    const totalProfit = totalAssets - totalCost;
    const totalProfitRate = totalCost > 0 ? totalProfit / totalCost : 0;

    return {
      code: 200,
      message: "success",
      success: true,
      data: {
        totalAssets,
        totalProfit,
        totalProfitRate,
        totalCost,
        holdingsCount: holdings.length,
      },
    };
  } catch (error) {
    console.error("获取持仓统计失败:", error);
    return {
      code: 500,
      message: "获取持仓统计失败",
      success: false,
      data: {
        totalAssets: 0,
        totalProfit: 0,
        totalProfitRate: 0,
        totalCost: 0,
        holdingsCount: 0,
      },
    };
  }
}
