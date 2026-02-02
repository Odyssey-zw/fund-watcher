/**
 * 基金相关 API
 */

import type {
  ApiResponse,
  PaginationParams,
  PaginationResult,
} from "~/types/common";
import type { FundSearchResult } from "~/types/fund";
import Taro from "@tarojs/taro";
import { FUND_API_URLS, HOT_FUND_CODES } from "~/constants/fund";

/**
 * 获取热门基金列表（返回列表页所需的净值与涨跌幅）
 * @param params 分页参数
 * @returns 热门基金列表
 */
export async function getHotFunds(
  params: PaginationParams,
): Promise<ApiResponse<PaginationResult<FundSearchResult>>> {
  try {
    console.log("[API] 开始获取热门基金数据...");

    // 批量获取基金数据
    const fundPromises = HOT_FUND_CODES.map(code => getSinaFundData(code));
    const sinaDataList = await Promise.all(fundPromises);

    // 转换为 FundSearchResult 格式
    const funds: FundSearchResult[] = sinaDataList
      .map(sinaData => convertSinaDataToFundSearchResult(sinaData))
      .filter((fund): fund is FundSearchResult => fund !== null)
      .map(fund => ({
        ...fund,
        // 保留一些模拟数据字段（这些需要从其他接口获取）
        tags: [],
        returnAfterAddition: undefined,
        durationDays: undefined,
        currentValue: {
          // 这些数据需要从其他接口获取，暂时留空
        },
      }));

    console.log(`[API] 成功获取 ${funds.length} 只基金数据`);

    // 实现分页
    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    const paginatedData = funds.slice(startIndex, endIndex);

    return {
      code: 200,
      message: "success",
      success: true,
      data: {
        list: paginatedData,
        total: funds.length,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(funds.length / params.pageSize),
      },
    };
  } catch (error) {
    console.error("获取热门基金失败:", error);
    // 失败时返回空列表
    return {
      code: 500,
      message: "获取热门基金失败",
      success: false,
      data: {
        list: [],
        total: 0,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: 0,
      },
    };
  }
}

/**
 * 从新浪财经获取单个基金数据
 * @param fundCode 基金代码（如：005911）
 * @returns 基金实时数据
 */
async function getSinaFundData(fundCode: string): Promise<any | null> {
  try {
    const sinaUrl = FUND_API_URLS.getSinaFundUrl(fundCode);
    const response = await Taro.request({
      url: sinaUrl,
      method: "GET",
      dataType: "text",
      header: {
        "Content-Type": "application/json",
      },
    });

    const responseText = response.data as string;
    if (typeof responseText === "string") {
      const jsonMatch = responseText.match(/jsonpgz\((.*)\)/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch {
          return null;
        }
      }
    }
    return null;
  } catch (error) {
    console.error(`获取基金${fundCode}数据失败:`, error);
    return null;
  }
}

/**
 * 将新浪财经数据格式转换为 FundSearchResult
 */
function convertSinaDataToFundSearchResult(
  sinaData: any,
): FundSearchResult | null {
  if (!sinaData || !sinaData.fundcode) {
    return null;
  }

  // 从基金名称推断类型（简单处理）
  const name = sinaData.name || "";
  let type = "hh"; // 默认混合型
  if (name.includes("指数") || name.includes("ETF")) {
    type = "zs";
  } else if (name.includes("股票") || name.includes("偏股")) {
    type = "gp";
  } else if (name.includes("债券") || name.includes("偏债")) {
    type = "zq";
  }

  // 新浪财经 API 返回的 gszzl 已经是百分比格式（如 "1.61" 表示 1.61%）
  // 需要除以 100 转换为小数格式，以便 formatPercentage 函数正确处理
  const estimateChange = sinaData.gszzl
    ? Number.parseFloat(sinaData.gszzl) / 100
    : undefined;

  return {
    code: sinaData.fundcode,
    name: sinaData.name || "",
    type,
    unitValue: sinaData.dwjz ? Number.parseFloat(sinaData.dwjz) : undefined,
    estimateValue: sinaData.gsz ? Number.parseFloat(sinaData.gsz) : undefined,
    estimateChange,
    estimateTime: sinaData.gztime || undefined, // 估值时间，如 "2026-01-30 15:00"
    // 注意：新浪财经 API 不直接提供日涨跌幅，需要从其他接口获取
    dayGrowthRate: undefined,
    tags: [],
  };
}
