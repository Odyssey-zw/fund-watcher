/**
 * 基金相关 API
 */

import type {
  ApiResponse,
  PaginationParams,
  PaginationResult,
} from "~/types/common";
import type { FundDetail, FundSearchResult, FundValue } from "~/types/fund";

// 新浪财经基金数据API端点
const SINA_FUND_API_BASE = "https://api.fund.eastmoney.com";
const SINA_FUND_INFO_API = "https://fundgz.1234567.com.cn";

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
    const mockFunds: FundSearchResult[] = [
      {
        code: "005911",
        name: "广发双擎升级混合",
        type: "hh",
        unitValue: 2.3456,
        dayGrowthRate: 2.34,
        estimateValue: 2.3512,
        estimateChange: 0.24,
        tags: ["持有", "跑赢赛道"],
        returnAfterAddition: 13.01,
        durationDays: 128,
        currentValue: {
          week1GrowthRate: 1.2,
          month1GrowthRate: 3.5,
          month6GrowthRate: 8.2,
        },
      },
      {
        code: "002311",
        name: "银华鑫盛灵活配置",
        type: "hh",
        unitValue: 1.8945,
        dayGrowthRate: 1.87,
        estimateValue: 1.9012,
        estimateChange: 0.35,
        tags: ["高夏普比率", "低回撤率"],
        returnAfterAddition: -1.08,
        durationDays: 45,
        currentValue: {
          week1GrowthRate: -0.5,
          month1GrowthRate: 1.2,
          month6GrowthRate: 2.8,
        },
      },
      {
        code: "161725",
        name: "招商中证白酒指数",
        type: "zs",
        unitValue: 0.8912,
        dayGrowthRate: -1.23,
        estimateValue: 0.8898,
        estimateChange: -0.15,
        tags: ["指数型", "绩优规模小"],
        returnAfterAddition: 5.62,
        durationDays: 92,
        currentValue: {
          week1GrowthRate: -2.1,
          month1GrowthRate: 0.8,
          month6GrowthRate: 5.1,
        },
      },
      {
        code: "001632",
        name: "天弘沪深300ETF联接",
        type: "etf",
        unitValue: 1.2345,
        dayGrowthRate: 0.78,
        estimateValue: 1.2368,
        estimateChange: 0.19,
        tags: ["跑赢偏股基"],
        returnAfterAddition: 2.33,
        durationDays: 60,
        currentValue: {
          week1GrowthRate: 0.6,
          month1GrowthRate: 2.1,
          month6GrowthRate: 4.3,
        },
      },
      {
        code: "003096",
        name: "中欧医疗健康混合",
        type: "hh",
        unitValue: 2.789,
        dayGrowthRate: -0.56,
        estimateValue: 2.7756,
        estimateChange: -0.48,
        tags: ["持有", "低估有潜力"],
        returnAfterAddition: -2.82,
        durationDays: 30,
        currentValue: {
          week1GrowthRate: -1.2,
          month1GrowthRate: -0.3,
          month6GrowthRate: 1.5,
        },
      },
      {
        code: "000071",
        name: "华夏回报混合",
        type: "hh",
        unitValue: 1.5678,
        dayGrowthRate: 0.34,
        estimateValue: 1.5692,
        estimateChange: 0.09,
        tags: ["持有"],
        returnAfterAddition: 9.21,
        durationDays: 156,
        currentValue: {
          week1GrowthRate: 0.9,
          month1GrowthRate: 2.4,
          month6GrowthRate: 6.8,
        },
      },
      {
        code: "110022",
        name: "易方达消费行业",
        type: "gp",
        unitValue: 3.2109,
        dayGrowthRate: 1.45,
        estimateValue: 3.2234,
        estimateChange: 0.39,
        tags: ["偏股", "绩优规模小"],
        returnAfterAddition: 8.15,
        durationDays: 88,
        currentValue: {
          week1GrowthRate: 2.1,
          month1GrowthRate: 4.2,
          month6GrowthRate: 12.5,
        },
      },
      {
        code: "001593",
        name: "天弘创业板ETF联接",
        type: "etf",
        unitValue: 1.1234,
        dayGrowthRate: -2.1,
        estimateValue: 1.1189,
        estimateChange: -0.4,
        tags: ["指数型"],
        returnAfterAddition: -6.07,
        durationDays: 22,
        currentValue: {
          week1GrowthRate: -3.2,
          month1GrowthRate: -1.5,
          month6GrowthRate: -2.8,
        },
      },
    ];

    // 实现分页
    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    const paginatedData = mockFunds.slice(startIndex, endIndex);

    return {
      code: 200,
      message: "success",
      success: true,
      data: {
        list: paginatedData,
        total: mockFunds.length,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(mockFunds.length / params.pageSize),
      },
    };
  } catch (error) {
    console.error("获取热门基金失败:", error);
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
 * 使用代理从新浪财经获取基金实时数据
 * @param fundCode 基金代码
 * @returns 基金实时数据
 */
export async function getFundRealTimeDataFromSina(
  fundCode: string,
): Promise<ApiResponse<any>> {
  try {
    // 由于小程序环境限制，直接访问外部API会有跨域问题
    // 在实际部署时，需要通过后端服务代理请求
    // 以下是模拟请求的结构，实际实现需要后端支持
    const proxyUrl = `/api/fund/${fundCode}`; // 这应该是你的后端代理地址

    // 在实际应用中，这里应该发送请求到你自己的后端服务器
    // 后端服务器再向新浪财经API发起请求并返回数据
    // 示例：
    /*
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    return result;
    */

    // 模拟数据，实际部署时应替换为真实的API调用
    const mockResponse = {
      fundcode: fundCode,
      name: `基金${fundCode}`,
      jzrq: new Date().toISOString().split("T")[0], // 基金净值日期
      dwjz: (1.0 + (Math.random() * 0.5 - 0.1)).toFixed(4), // 单位净值
      gszzl: (Math.random() * 4 - 2).toFixed(2), // 估算涨跌幅
      gztime: new Date().toLocaleString(), // 估值时间
    };

    return {
      code: 200,
      message: "success",
      success: true,
      data: mockResponse,
    };
  } catch (error) {
    console.error(`获取基金${fundCode}实时数据失败:`, error);
    return {
      code: 500,
      message: "获取基金实时数据失败",
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
