/**
 * 持仓相关 API
 */

import type { ApiResponse } from "~/types/common";
import type { FundPosition } from "~/types/fund";
import Taro from "@tarojs/taro";
import { useFundStore } from "~/store/useFundStore";

const STORAGE_KEY = "fund_positions";

/**
 * 获取用户持仓列表
 */
export async function getPositions(): Promise<ApiResponse<FundPosition[]>> {
  try {
    const storedData = Taro.getStorageSync(STORAGE_KEY);
    const positions: FundPosition[] = storedData || [];

    // 从全局缓存获取基金实时数据
    const fundCodes = positions.map(p => p.fundCode);
    const fundStore = useFundStore.getState();
    const realTimeDataMap = await fundStore.batchGetFundRealTimeData(fundCodes);

    // 计算收益
    const updatedPositions = positions.map(position => {
      const realTimeData = realTimeDataMap[position.fundCode];
      if (realTimeData) {
        const currentValue = realTimeData.currentValue;
        const marketValue = position.shares * currentValue;
        const profit = marketValue - position.cost;
        const profitRate = position.cost > 0 ? profit / position.cost : 0;

        return {
          ...position,
          currentValue,
          marketValue,
          profit,
          profitRate,
        };
      }
      return position;
    });

    return {
      code: 200,
      message: "success",
      success: true,
      data: updatedPositions,
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
export async function addPosition(
  position: Omit<FundPosition, "currentValue" | "marketValue" | "profit" | "profitRate">,
): Promise<ApiResponse<boolean>> {
  try {
    const storedData = Taro.getStorageSync(STORAGE_KEY);
    const positions: FundPosition[] = storedData || [];

    // 检查是否已存在相同基金的持仓
    const existingIndex = positions.findIndex(p => p.fundCode === position.fundCode);

    if (existingIndex >= 0) {
      // 更新现有持仓（合并份额和成本）
      const existing = positions[existingIndex];
      const totalShares = existing.shares + position.shares;
      const totalCost = existing.cost + position.cost;

      positions[existingIndex] = {
        ...existing,
        shares: totalShares,
        cost: totalCost,
        buyDate: position.buyDate, // 使用最新的买入日期
      };
    } else {
      // 添加新持仓
      positions.push(position as FundPosition);
    }

    Taro.setStorageSync(STORAGE_KEY, positions);

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
export async function updatePosition(fundCode: string, updates: Partial<FundPosition>): Promise<ApiResponse<boolean>> {
  try {
    const storedData = Taro.getStorageSync(STORAGE_KEY);
    const positions: FundPosition[] = storedData || [];

    const index = positions.findIndex(p => p.fundCode === fundCode);
    if (index >= 0) {
      positions[index] = { ...positions[index], ...updates };
      Taro.setStorageSync(STORAGE_KEY, positions);

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
export async function deletePosition(fundCode: string): Promise<ApiResponse<boolean>> {
  try {
    const storedData = Taro.getStorageSync(STORAGE_KEY);
    const positions: FundPosition[] = storedData || [];

    const filteredPositions = positions.filter(p => p.fundCode !== fundCode);
    Taro.setStorageSync(STORAGE_KEY, filteredPositions);

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
export async function clearAllPositions(): Promise<ApiResponse<boolean>> {
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
export async function getPositionSummary(): Promise<
  ApiResponse<{
    totalAssets: number;
    totalProfit: number;
    totalProfitRate: number;
    totalCost: number;
    positionCount: number;
  }>
> {
  try {
    const response = await getPositions();
    if (!response.success) {
      throw new Error("获取持仓列表失败");
    }

    const positions = response.data;
    const totalAssets = positions.reduce((sum, p) => sum + (p.marketValue || 0), 0);
    const totalCost = positions.reduce((sum, p) => sum + p.cost, 0);
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
        positionCount: positions.length,
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
        positionCount: 0,
      },
    };
  }
}
