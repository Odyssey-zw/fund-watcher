/**
 * 基金相关 API
 */

import type {
  ApiResponse,
  PaginationParams,
  PaginationResult,
} from "~/types/common";
import type { FundDetail, FundSearchResult, FundValue } from "~/types/fund";
import Taro from "@tarojs/taro";
import { HOT_FUND_CODES } from "~/constants/fund";

/**
 * 搜索基金
 * @param keyword 搜索关键词（基金代码或名称）
 * @returns 基金搜索结果
 */
export async function searchFunds(
  keyword: string,
): Promise<ApiResponse<FundSearchResult[]>> {
  try {
    // 使用模拟数据，因为真实API可能需要处理跨域问题
    const mockData: FundSearchResult[] = [
      {
        code: "005911",
        name: "广发双擎升级混合",
        type: "hh",
        unitValue: 2.3456,
        dayGrowthRate: 2.34,
      },
      {
        code: "002311",
        name: "银华鑫盛灵活配置",
        type: "hh",
        unitValue: 1.8945,
        dayGrowthRate: 1.87,
      },
      {
        code: "161725",
        name: "招商中证白酒指数",
        type: "zs",
        unitValue: 0.8912,
        dayGrowthRate: -1.23,
      },
      {
        code: "001632",
        name: "天弘沪深300ETF联接",
        type: "etf",
        unitValue: 1.2345,
        dayGrowthRate: 0.78,
      },
      {
        code: "003096",
        name: "中欧医疗健康混合",
        type: "hh",
        unitValue: 2.789,
        dayGrowthRate: -0.56,
      },
      {
        code: "000071",
        name: "华夏回报混合",
        type: "hh",
        unitValue: 1.5678,
        dayGrowthRate: 0.34,
      },
      {
        code: "110022",
        name: "易方达消费行业",
        type: "gp",
        unitValue: 3.2109,
        dayGrowthRate: 1.45,
      },
      {
        code: "001593",
        name: "天弘创业板ETF联接",
        type: "etf",
        unitValue: 1.1234,
        dayGrowthRate: -2.1,
      },
    ];

    if (!keyword) {
      return {
        code: 200,
        message: "success",
        success: true,
        data: mockData,
      };
    }

    const filtered = mockData.filter(
      fund => fund.code.includes(keyword) || fund.name.includes(keyword),
    );

    return {
      code: 200,
      message: "success",
      success: true,
      data: filtered,
    };
  } catch (error) {
    console.error("搜索基金失败:", error);
    return {
      code: 500,
      message: "搜索基金失败",
      success: false,
      data: [],
    };
  }
}

/**
 * 获取基金详情
 * @param fundCode 基金代码
 * @returns 基金详情
 */
export async function getFundDetail(
  fundCode: string,
): Promise<ApiResponse<FundDetail>> {
  try {
    // 构建模拟数据
    const mockDetail: FundDetail = {
      code: fundCode,
      name: `基金${fundCode}`,
      type: "hh",
      company: "某基金公司",
      riskLevel: 3,
      establishDate: "2020-01-01",
      currentValue: {
        code: fundCode,
        date: new Date().toISOString().split("T")[0],
        unitValue: 1.2345,
        totalValue: 1.5678,
        dayGrowthRate: 1.23,
        dayGrowthAmount: 0.0123,
        week1GrowthRate: 2.34,
        month1GrowthRate: 3.45,
        month3GrowthRate: 5.67,
        month6GrowthRate: 8.9,
        year1GrowthRate: 12.34,
        sinceEstablishmentGrowthRate: 23.45,
      },
      historyValues: [
        {
          code: fundCode,
          date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
          unitValue: 1.2222,
          totalValue: 1.5555,
          dayGrowthRate: 0.5,
          dayGrowthAmount: 0.0061,
        },
        {
          code: fundCode,
          date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
          unitValue: 1.2161,
          totalValue: 1.5494,
          dayGrowthRate: -0.3,
          dayGrowthAmount: -0.0037,
        },
      ],
    };

    return {
      code: 200,
      message: "success",
      success: true,
      data: mockDetail,
    };
  } catch (error) {
    console.error(`获取基金${fundCode}详情失败:`, error);
    return {
      code: 500,
      message: "获取基金详情失败",
      success: false,
      data: {} as FundDetail,
    };
  }
}

/**
 * 获取基金净值历史
 * @param fundCode 基金代码
 * @param params 分页参数
 * @returns 历史净值数据
 */
export async function getFundValueHistory(
  fundCode: string,
  params: PaginationParams,
): Promise<ApiResponse<PaginationResult<FundValue>>> {
  try {
    // 生成模拟的历史净值数据
    const historyData: FundValue[] = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const baseValue = 1.0 + (Math.random() * 0.5 - 0.1); // 0.9 - 1.5之间的随机值
      const growthRate = Math.random() * 4 - 2; // -2% 到 2% 之间的随机涨幅

      historyData.push({
        code: fundCode,
        date: date.toISOString().split("T")[0],
        unitValue: Number.parseFloat(baseValue.toFixed(4)),
        totalValue: Number.parseFloat((baseValue + 0.2).toFixed(4)), // 累计净值比单位净值高一些
        dayGrowthRate: Number.parseFloat(growthRate.toFixed(2)),
        dayGrowthAmount: Number.parseFloat(
          ((baseValue * growthRate) / 100).toFixed(4),
        ),
      });
    }

    // 实现分页
    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    const paginatedData = historyData.slice(startIndex, endIndex);

    return {
      code: 200,
      message: "success",
      success: true,
      data: {
        list: paginatedData,
        total: historyData.length,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(historyData.length / params.pageSize),
      },
    };
  } catch (error) {
    console.error(`获取基金${fundCode}历史净值失败:`, error);
    return {
      code: 500,
      message: "获取基金历史净值失败",
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
 * 获取基金实时净值
 * @param fundCodes 基金代码数组
 * @returns 实时净值数据
 */
export async function getFundRealTimeValues(
  fundCodes: string[],
): Promise<ApiResponse<FundValue[]>> {
  try {
    // 生成模拟的实时净值数据
    const realTimeValues: FundValue[] = fundCodes.map(code => {
      const baseValue = 1.0 + (Math.random() * 0.5 - 0.1); // 0.9 - 1.5之间的随机值
      const growthRate = Math.random() * 4 - 2; // -2% 到 2% 之间的随机涨幅

      return {
        code,
        date: new Date().toISOString().split("T")[0],
        unitValue: Number.parseFloat(baseValue.toFixed(4)),
        totalValue: Number.parseFloat((baseValue + 0.2).toFixed(4)), // 累计净值比单位净值高一些
        dayGrowthRate: Number.parseFloat(growthRate.toFixed(2)),
        dayGrowthAmount: Number.parseFloat(
          ((baseValue * growthRate) / 100).toFixed(4),
        ),
      };
    });

    return {
      code: 200,
      message: "success",
      success: true,
      data: realTimeValues,
    };
  } catch (error) {
    console.error("获取基金实时净值失败:", error);
    return {
      code: 500,
      message: "获取基金实时净值失败",
      success: false,
      data: [],
    };
  }
}

/**
 * 从新浪财经获取单个基金数据
 * @param fundCode 基金代码（如：005911）
 * @returns 基金实时数据
 */
async function getSinaFundData(
  fundCode: string,
): Promise<any | null> {
  try {
    const sinaUrl = `https://fundgz.1234567.com.cn/js/${fundCode}.js`;
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
function convertSinaDataToFundSearchResult(sinaData: any): FundSearchResult | null {
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

/**
 * 测试新浪财经 API 是否可用
 * @param fundCode 基金代码（如：005911）
 * @returns 基金实时数据
 */
export async function testSinaFundAPI(
  fundCode: string,
): Promise<ApiResponse<any>> {
  try {
    // 新浪财经基金实时估值 API
    // 格式：https://fundgz.1234567.com.cn/js/{fundCode}.js
    // 返回 JSONP 格式数据
    const sinaUrl = `https://fundgz.1234567.com.cn/js/${fundCode}.js`;

    console.log(`[测试] 尝试调用新浪财经 API: ${sinaUrl}`);
    const jsonData = await getSinaFundData(fundCode);
    console.log(`[测试] 新浪财经 API 响应:`, jsonData);

    if (jsonData) {
      return {
        code: 200,
        message: "success",
        success: true,
        data: jsonData,
      };
    }

    return {
      code: 500,
      message: "API 调用失败",
      success: false,
      data: null,
    };
  } catch (error: any) {
    console.error(`[测试] 获取基金${fundCode}实时数据失败:`, error);
    return {
      code: 500,
      message: error?.message || "获取基金实时数据失败",
      success: false,
      data: {
        error: error?.message || String(error),
        stack: error?.stack,
      },
    };
  }
}

/**
 * 使用代理从新浪财经获取基金实时数据
 * @param fundCode 基金代码
 * @returns 基金实时数据
 */
export async function getFundRealTimeDataFromSina(
  fundCode: string,
): Promise<ApiResponse<any>> {
  try {
    const sinaData = await getSinaFundData(fundCode);
    if (sinaData) {
      return {
        code: 200,
        message: "success",
        success: true,
        data: sinaData,
      };
    }

    // 如果获取失败，返回错误
    return {
      code: 500,
      message: "获取基金实时数据失败",
      success: false,
      data: null,
    };
  } catch (error: any) {
    console.error(`获取基金${fundCode}实时数据失败:`, error);
    return {
      code: 500,
      message: error?.message || "获取基金实时数据失败",
      success: false,
      data: null,
    };
  }
}

/**
 * 从天天基金网获取基金数据
 * @param fundCode 基金代码
 * @returns 基金数据
 */
export async function getFundDataFromEastMoney(
  fundCode: string,
): Promise<ApiResponse<any>> {
  try {
    // 由于小程序环境限制，需要通过后端代理
    // 模拟返回数据结构
    const mockResponse = {
      fund_code: fundCode,
      fund_name: `基金${fundCode}`,
      net_worth: (1.0 + (Math.random() * 0.5 - 0.1)).toFixed(4), // 单位净值
      cumulative_net_worth: (1.2 + (Math.random() * 0.5 - 0.1)).toFixed(4), // 累计净值
      daily_growth_rate: (Math.random() * 4 - 2).toFixed(2), // 日增长率
      update_date: new Date().toISOString().split("T")[0],
      // 其他可能的数据字段...
    };

    return {
      code: 200,
      message: "success",
      success: true,
      data: mockResponse,
    };
  } catch (error) {
    console.error(`获取基金${fundCode}数据失败:`, error);
    return {
      code: 500,
      message: "获取基金数据失败",
      success: false,
      data: null,
    };
  }
}

/**
 * 批量获取基金实时数据
 * @param fundCodes 基金代码数组
 * @returns 基金实时数据数组
 */
export async function getBatchFundData(
  fundCodes: string[],
): Promise<ApiResponse<any[]>> {
  try {
    // 模拟批量获取数据
    const promises = fundCodes.map(code => getFundRealTimeDataFromSina(code));
    const results = await Promise.all(promises);

    const successfulResults = results
      .filter(result => result.success && result.data)
      .map(result => result.data);

    return {
      code: 200,
      message: "success",
      success: true,
      data: successfulResults,
    };
  } catch (error) {
    console.error("批量获取基金数据失败:", error);
    return {
      code: 500,
      message: "批量获取基金数据失败",
      success: false,
      data: [],
    };
  }
}
