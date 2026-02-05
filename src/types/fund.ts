/**
 * 基金相关类型定义
 */

/**
 * 基金基础信息
 */
export interface FundInfo {
  /** 基金代码 */
  code: string;
  /** 基金名称 */
  name: string;
  /** 基金类型 */
  type: string;
  /** 基金公司 */
  company: string;
  /** 风险等级 1-5 */
  riskLevel: number;
  /** 成立日期 */
  establishDate: string;
}

/**
 * 基金净值信息
 */
export interface FundValue {
  /** 基金代码 */
  code: string;
  /** 净值日期 */
  date: string;
  /** 单位净值 */
  unitValue: number;
  /** 累计净值 */
  totalValue: number;
  /** 日涨跌幅 */
  dayGrowthRate: number;
  /** 日涨跌额 */
  dayGrowthAmount: number;
  /** 近1周涨跌幅 */
  week1GrowthRate?: number;
  /** 近1月涨跌幅 */
  month1GrowthRate?: number;
  /** 近3月涨跌幅 */
  month3GrowthRate?: number;
  /** 近6月涨跌幅 */
  month6GrowthRate?: number;
  /** 近1年涨跌幅 */
  year1GrowthRate?: number;
  /** 成立以来涨跌幅 */
  sinceEstablishmentGrowthRate?: number;
}

/**
 * 基金详细信息（包含净值）
 */
export interface FundDetail extends FundInfo {
  /** 当前净值信息 */
  currentValue: FundValue;
  /** 历史净值数据 */
  historyValues?: FundValue[];
}

/**
 * 用户持仓信息
 */
export interface FundPosition {
  /** 基金代码 */
  fundCode: string;
  /** 基金名称 */
  fundName: string;
  /** 持有份额 */
  shares: number;
  /** 持仓成本 */
  cost: number;
  /** 买入日期 */
  buyDate: string;
  /** 当前净值 */
  currentValue?: number;
  /** 当前市值 */
  marketValue?: number;
  /** 浮动盈亏 */
  profit?: number;
  /** 盈亏比例 */
  profitRate?: number;
}

/**
 * 基金搜索结果（列表项）
 */
export interface FundSearchResult {
  /** 基金代码 */
  code: string;
  /** 基金名称 */
  name: string;
  /** 基金类型 */
  type: string;
  /** 当前净值 */
  unitValue?: number;
  /** 日涨跌幅（百分比，如 2.34 表示 2.34%） */
  dayGrowthRate?: number;
  /** 当前净值详情（可选，列表有时不含） */
  currentValue?: Partial<FundValue>;
  /** 标签（如：持有、跑赢赛道、高夏普比率等） */
  tags?: string[];
  /** 估值 */
  estimateValue?: number;
  /** 估值涨跌幅（百分比） */
  estimateChange?: number;
  /** 估值时间 */
  estimateTime?: string;
  /** 添加后收益（百分比或金额） */
  returnAfterAddition?: number;
  /** 添加时长（天） */
  durationDays?: number;
}

/**
 * 图表数据点
 */
export interface FundChartData {
  /** 时间戳或日期字符串 */
  time: string;
  /** 净值 */
  value: number;
  /** 成交量（可选） */
  volume?: number;
  /** 涨跌幅（可选） */
  change?: number;
}

/**
 * 基金性能指标
 */
export interface FundPerformanceMetrics {
  /** 夏普比率 */
  sharpeRatio?: number;
  /** 最大回撤 */
  maxDrawdown?: number;
  /** 波动率 */
  volatility?: number;
  /** 年化收益率 */
  annualizedReturn?: number;
}

/**
 * 基金详情页数据
 */
export interface FundDetailPage extends FundInfo {
  /** 当前净值信息 */
  currentValue: FundValue;
  /** 图表数据 */
  chartData: FundChartData[];
  /** 性能指标 */
  performanceMetrics?: FundPerformanceMetrics;
  /** 基金经理 */
  manager?: string;
  /** 基金规模 */
  scale?: string;
  /** 成立日期 */
  establishDate: string;
}

/**
 * 图表时间周期
 */
export type FundChartPeriod = "1d" | "5d" | "1m" | "3m" | "6m" | "1y" | "all";
