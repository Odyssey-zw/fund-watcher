/**
 * 基金相关 API
 */

import type { SinaFundData } from "./fund-internal";
import type { ApiResponse, PaginationParams, PaginationResult } from "~/types/common";
import type { FundChartData, FundChartPeriod, FundDetailPage, FundSearchResult } from "~/types/fund";
import Taro from "@tarojs/taro";
import { FUND_API_URLS, HOT_FUND_CODES } from "~/constants/fund";
import { getSinaFundData } from "./fund-internal";

const isDev = process.env.NODE_ENV !== "production";
const HOT_FUNDS_CACHE_MS = 30_000; // 30 秒内分页/刷新复用同一份数据，减少重复请求

let hotFundsCache: { list: FundSearchResult[]; timestamp: number } | null = null;

function getCachedHotFunds(): FundSearchResult[] | null {
  if (!hotFundsCache) {
    return null;
  }
  if (Date.now() - hotFundsCache.timestamp > HOT_FUNDS_CACHE_MS) {
    hotFundsCache = null;
    return null;
  }
  return hotFundsCache.list;
}

/**
 * 获取热门基金列表（返回列表页所需的净值与涨跌幅）
 * 30 秒内多次请求（分页/刷新）会复用缓存，避免重复拉取全部基金。
 * @param params 分页参数
 * @returns 热门基金列表
 */
export async function getHotFunds(params: PaginationParams): Promise<ApiResponse<PaginationResult<FundSearchResult>>> {
  try {
    const cached = getCachedHotFunds();
    if (cached) {
      const startIndex = (params.page - 1) * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      const paginatedData = cached.slice(startIndex, endIndex);
      return {
        code: 200,
        message: "success",
        success: true,
        data: {
          list: paginatedData,
          total: cached.length,
          page: params.page,
          pageSize: params.pageSize,
          totalPages: Math.ceil(cached.length / params.pageSize),
        },
      };
    }

    if (isDev) {
      console.log("[API] 开始获取热门基金数据...");
    }

    // 批量获取基金数据
    const fundPromises = HOT_FUND_CODES.map(code => getSinaFundData(code));
    const sinaDataList = await Promise.all(fundPromises);

    // 转换为 FundSearchResult 格式
    const funds: FundSearchResult[] = sinaDataList
      .map(sinaData => convertSinaDataToFundSearchResult(sinaData))
      .filter((fund): fund is FundSearchResult => fund !== null)
      .map(fund => ({
        ...fund,
        tags: [],
        returnAfterAddition: undefined,
        durationDays: undefined,
        currentValue: {},
      }));

    hotFundsCache = { list: funds, timestamp: Date.now() };
    if (isDev) {
      console.log(`[API] 成功获取 ${funds.length} 只基金数据`);
    }

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
 * 获取基金详情数据
 * @param fundCode 基金代码
 * @returns 基金详情信息
 */
export async function getFundDetail(fundCode: string): Promise<ApiResponse<FundDetailPage>> {
  try {
    if (isDev) {
      console.log(`[API] 开始获取基金${fundCode}详情数据...`);
    }

    // 获取基金实时数据
    const sinaData = await getSinaFundData(fundCode);
    if (!sinaData) {
      throw new Error("获取基金数据失败");
    }

    // 计算日涨跌额
    const unitValue = sinaData.dwjz ? Number.parseFloat(sinaData.dwjz) : 0;
    const dayGrowthRate = sinaData.gszzl ? Number.parseFloat(sinaData.gszzl) / 100 : 0;
    const dayGrowthAmount = (unitValue * dayGrowthRate) / (1 + dayGrowthRate);

    // 从新浪财经数据中提取更多信息
    const fundName = sinaData.name || `基金${fundCode}`;
    const fundType = inferFundType(sinaData.name || "");

    // 尝从基金名称中提取公司信息（通常基金名称格式為"公司名-基金名"或包含公司名）
    const companyName = extractCompanyName(fundName);

    // 预估風險等級（基於基金類型）
    const riskLevel = estimateRiskLevel(fundType, fundName);

    // 从东财接口补充经理 / 规模 / 成立日期等信息（失败则忽略，前端用占位符）
    const extraInfo = await getFundExtraInfoFromEastmoney(fundCode);

    // 返回基本信息 + 部分详情（历史图表在页面单独请求）
    const fundDetail: FundDetailPage = {
      code: fundCode,
      name: fundName,
      type: fundType,
      company: companyName,
      riskLevel,
      establishDate: extraInfo?.establishDate || sinaData.jzrq || "",
      manager: extraInfo?.manager || "",
      scale: extraInfo?.scale || "",
      currentValue: {
        code: fundCode,
        date: sinaData.jzrq || "",
        unitValue,
        totalValue: unitValue,
        dayGrowthRate,
        dayGrowthAmount,
      },
      chartData: [], // 图表数据将在页面中单独请求真实历史数据
      performanceMetrics: {
        // 提供默认值，后续在页面中更新
        sharpeRatio: 0,
        maxDrawdown: 0,
        volatility: 0,
        annualizedReturn: 0,
      },
    };

    if (isDev) {
      console.log(`[API] 成功获取基金${fundCode}详情数据`, fundDetail);
    }

    return {
      code: 200,
      message: "success",
      success: true,
      data: fundDetail,
    };
  } catch (error) {
    console.error(`获取基金${fundCode}详情失败:`, error);
    return {
      code: 500,
      message: `获取基金${fundCode}详情失败`,
      success: false,
      data: {} as FundDetailPage,
    };
  }
}

/**
 * 获取基金图表历史数据
 * @param fundCode 基金代码
 * @param period 时间周期
 * @returns 图表数据
 */
export async function getFundChartData(
  fundCode: string,
  period: FundChartPeriod = "1m",
): Promise<ApiResponse<FundChartData[]>> {
  try {
    const url = FUND_API_URLS.getEastmoneyHistoryUrl(fundCode);
    if (isDev) {
      console.log("[API] 获取历史净值 URL:", url);
    }

    const response = await Taro.request<string>({
      url,
      method: "GET",
      dataType: "text",
    });
    const html = (response.data as unknown as string) || "";
    const chartData = parseEastmoneyHistoryToChartData(html, period);
    if (isDev) {
      console.log("[API] 解析后的历史净值点数:", chartData.length);
    }

    return {
      code: 200,
      message: "success",
      success: true,
      data: chartData,
    };
  } catch (error) {
    console.error(`获取基金${fundCode}图表数据失败:`, error);
    return {
      code: 500,
      message: "获取图表数据失败",
      success: false,
      data: [],
    };
  }
}

/**
 * 解析东财历史净值 HTML 为图表数据
 * 注意：东财返回的是包含 <table> 的 HTML 或 apidata.content，我们这里做一个鲁棒性较强的解析
 */
function parseEastmoneyHistoryToChartData(html: string, period: FundChartPeriod): FundChartData[] {
  if (!html) {
    return [];
  }

  // 如果是 apidata={content:"<table>...</table>", ...} 这种结构，先把 content 提取出来
  const contentMatch = html.match(/content:"([\s\S]*?)"/);
  let tableHtml = html;
  if (contentMatch && contentMatch[1]) {
    tableHtml = contentMatch[1];
  }

  const tbodyMatch = tableHtml.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
  if (!tbodyMatch || !tbodyMatch[1]) {
    return [];
  }

  const tbody = tbodyMatch[1];
  const rows: string[] = [];
  const rowMatches = tbody.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  for (const match of rowMatches) {
    if (match[1]) {
      rows.push(match[1]);
    }
  }

  const data: FundChartData[] = [];
  for (const row of rows) {
    const cols: string[] = [];
    const colMatches = row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi);
    for (const colMatch of colMatches) {
      const cell = colMatch[1] || "";
      // 去掉 HTML 标签和空白
      const text = cell.replace(/<[^>]*>/g, "").trim();
      cols.push(text);
    }

    if (cols.length < 2) {
      continue;
    }
    const dateStr = cols[0]; // 日期
    const navStr = cols[1]; // 单位净值
    const nav = Number.parseFloat(navStr);
    if (!dateStr || Number.isNaN(nav)) {
      continue;
    }

    data.push({
      time: dateStr,
      value: nav,
      change: 0, // 涨跌幅后面可根据相邻两日自己算，这里保持 0
    });
  }

  // 東财返回通常是按日期降序，这里反转成升序
  data.sort((a, b) => (a.time > b.time ? 1 : -1));

  if (data.length === 0) {
    return data;
  }

  // 根据周期过滤数据（放宽范围以显示更多数据点）
  const endDate = new Date(data[data.length - 1].time.replace(/-/g, "/"));
  const startDate = new Date(endDate);
  switch (period) {
    case "1d":
      startDate.setDate(endDate.getDate() - 5);
      break;
    case "5d":
      startDate.setDate(endDate.getDate() - 14);
      break;
    case "1m":
      startDate.setMonth(endDate.getMonth() - 2);
      break;
    case "3m":
      startDate.setMonth(endDate.getMonth() - 5);
      break;
    case "6m":
      startDate.setMonth(endDate.getMonth() - 11);
      break;
    case "1y":
      startDate.setFullYear(endDate.getFullYear() - 2);
      break;
    case "all":
    default:
      return data;
  }

  const startTime = startDate.getTime();
  return data.filter(item => {
    const t = new Date(item.time.replace(/-/g, "/")).getTime();
    return t >= startTime;
  });
}

/**
 * 从东财 pingzhongdata 接口补充基金经理 / 规模 / 成立日期
 * 注意：该接口返回 JS 代码，这里做非常温和的解析，失败时直接返回 null（前端显示占位符）
 */
async function getFundExtraInfoFromEastmoney(fundCode: string): Promise<{
  manager?: string;
  scale?: string;
  establishDate?: string;
} | null> {
  try {
    const url = FUND_API_URLS.getEastmoneyDetailUrl(fundCode);
    const response = await Taro.request<string>({
      url,
      method: "GET",
      dataType: "text",
    });
    const jsText = (response.data as unknown as string) || "";

    let establishDate: string | undefined;
    let scale: string | undefined;
    let manager: string | undefined;

    // 1) 尝试从 fundinfo 对象解析
    const fundinfoMatch = jsText.match(/var\s+fundinfo\s*=\s*(\{[\s\S]*?\});\s*(?:\n|$)/m);
    if (fundinfoMatch && fundinfoMatch[1]) {
      const objStr = fundinfoMatch[1];
      const jsonLike = objStr.replace(/(\w+):/g, `"$1":`).replace(/'/g, `"`);
      try {
        const fundinfo = JSON.parse(jsonLike) as any;
        establishDate = fundinfo.establishDate ?? fundinfo.estabDate;
        scale = fundinfo.fundScale ?? fundinfo.FundScale ?? fundinfo.jjgm;
      } catch {
        // 忽略
      }
    }

    // 2) 兜底：用简单正则从全文提取常见字段（东财可能用单引号或双引号）
    if (!establishDate) {
      const d =
        jsText.match(/(?:establishDate|estabDate)["']?\s*:\s*["'](\d{4}-\d{2}-\d{2})["']/i)?.[1] ??
        jsText.match(/(?:establishDate|estabDate)["']?\s*:\s*["']([^"']+)["']/i)?.[1];
      if (d) {
        establishDate = d;
      }
    }
    if (!scale) {
      const s = jsText.match(/(?:[fF]undScale|jjgm)["']?\s*:\s*["']([^"']+)["']/)?.[1];
      if (s) {
        scale = s;
      }
    }

    // 3) 基金经理：Data_fundManager 数组里取第一个的 name
    const managerMatch = jsText.match(/var\s+Data_fundManager\s*=\s*(\[[\s\S]*?\]);/);
    if (managerMatch && managerMatch[1]) {
      const arrStr = managerMatch[1].replace(/(\w+):/g, `"$1":`).replace(/'/g, `"`);
      try {
        const managers = JSON.parse(arrStr) as Array<{ name?: string }>;
        if (Array.isArray(managers) && managers.length > 0) {
          manager = managers[0].name;
        }
      } catch {
        // 忽略
      }
    }
    if (!manager) {
      const m = jsText.match(/Data_fundManager[^[]*\[\s*\{[^}]*name\s*:\s*["']([^"']+)["']/);
      if (m) {
        manager = m[1];
      }
    }

    if (!manager && !scale && !establishDate) {
      return null;
    }

    return {
      manager,
      scale,
      establishDate,
    };
  } catch (error) {
    console.warn(`从东财补充基金${fundCode}详情失败:`, error);
    return null;
  }
}

/**
 * 将新浪财经数据格式转换为 FundSearchResult
 */
function convertSinaDataToFundSearchResult(sinaData: SinaFundData | null): FundSearchResult | null {
  if (!sinaData?.fundcode) {
    return null;
  }

  return {
    code: sinaData.fundcode,
    name: sinaData.name ?? "",
    type: inferFundType(sinaData.name ?? ""),
    unitValue: sinaData.dwjz ? Number.parseFloat(sinaData.dwjz) : undefined,
    estimateValue: sinaData.gsz ? Number.parseFloat(sinaData.gsz) : undefined,
    estimateChange: sinaData.gszzl ? Number.parseFloat(sinaData.gszzl) / 100 : undefined,
    estimateTime: sinaData.gztime ?? undefined,
    dayGrowthRate: undefined,
    tags: [],
  };
}

/**
 * 根据基金名称推断基金类型
 */
function inferFundType(name: string): string {
  if (name.includes("指数") || name.includes("ETF")) {
    return "zs";
  } else if (name.includes("股票") || name.includes("偏股")) {
    return "gp";
  } else if (name.includes("债券") || name.includes("偏债")) {
    return "zq";
  }
  return "hh"; // 默认混合型
}

/**
 * 从基金名称中提取基金公司名称
 */
function extractCompanyName(fundName: string): string {
  // 常见基金公司的关键词
  const companyKeywords = [
    { keywords: ["易方达"], name: "易方达基金" },
    { keywords: ["华夏"], name: "华夏基金" },
    { keywords: ["嘉实"], name: "嘉实基金" },
    { keywords: ["南方"], name: "南方基金" },
    { keywords: ["广发"], name: "广发基金" },
    { keywords: ["中欧"], name: "中欧基金" },
    { keywords: ["汇添富"], name: "汇添富基金" },
    { keywords: ["富国"], name: "富国基金" },
    { keywords: ["博时"], name: "博时基金" },
    { keywords: ["招商"], name: "招商基金" },
    { keywords: ["鹏华"], name: "鹏华基金" },
    { keywords: ["银华"], name: "银华基金" },
    { keywords: ["大成"], name: "大成基金" },
    { keywords: ["华安"], name: "华安基金" },
    { keywords: ["工银瑞信"], name: "工银瑞信基金" },
    { keywords: ["建信"], name: "建信基金" },
    { keywords: ["中银"], name: "中银基金" },
    { keywords: ["兴业"], name: "兴业基金" },
    { keywords: ["万家"], name: "万家基金" },
    { keywords: ["国泰"], name: "国泰基金" },
    { keywords: ["长盛"], name: "长盛基金" },
    { keywords: ["诺安"], name: "诺安基金" },
  ];

  for (const company of companyKeywords) {
    if (company.keywords.some(keyword => fundName.includes(keyword))) {
      return company.name;
    }
  }

  // 如果没有找到匹配的公司，返回空字符串，让前端显示"基金公司"
  return "基金公司";
}

/**
 * 根据基金类型和名称估算风险等级
 */
function estimateRiskLevel(fundType: string, fundName: string): number {
  // 根据基金名称关键词判断风险等级
  if (fundName.includes("货币") || fundName.includes("理财")) {
    return 1; // 低风险
  } else if (fundName.includes("债券") || fundName.includes("纯债")) {
    return 2; // 较低风险
  } else if (fundName.includes("混合") || fundName.includes("平衡")) {
    return 3; // 中等风险
  } else if (
    fundName.includes("股票") ||
    fundName.includes("成长") ||
    fundName.includes("创新") ||
    fundName.includes("科技") ||
    fundName.includes("医疗") ||
    fundName.includes("消费")
  ) {
    return 4; // 较高风险
  } else if (fundName.includes("指数") || fundName.includes("ETF")) {
    return fundType === "zs" ? 4 : 3; // 指数基金风险较高
  } else {
    // 根据基金类型判断
    switch (fundType) {
      case "zq": // 债券型
        return 2;
      case "hh": // 混合型
        return 3;
      case "gp": // 股票型
        return 4;
      case "zs": // 指数型
        return 4;
      default:
        return 3; // 默认中等风险
    }
  }
}
