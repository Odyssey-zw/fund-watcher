/**
 * 基金相关工具函数
 */

/**
 * 格式化基金净值
 * @param value - 净值
 * @param decimals - 小数位数，默认4位
 * @returns 格式化后的净值字符串
 */
export function formatFundValue(value: number | string, decimals = 4): string {
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(num)) {
    return "--";
  }
  return num.toFixed(decimals);
}

/**
 * 格式化涨跌幅
 * @param value - 涨跌幅值
 * @param showSign - 是否显示正号，默认true
 * @returns 格式化后的涨跌幅字符串
 */
export function formatPercentage(
  value: number | string,
  showSign = true,
): string {
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(num)) {
    return "--";
  }

  const formatted = (num * 100).toFixed(2);
  const sign = num > 0 && showSign ? "+" : "";
  return `${sign}${formatted}%`;
}

/**
 * 格式化金额
 * @param amount - 金额
 * @param showUnit - 是否显示单位
 * @returns 格式化后的金额字符串
 */
export function formatAmount(
  amount: number | string,
  showUnit = false,
): string {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (Number.isNaN(num)) {
    return "--";
  }

  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(2)}${showUnit ? "亿" : ""}`;
  } else if (num >= 10000) {
    return `${(num / 10000).toFixed(2)}${showUnit ? "万" : ""}`;
  } else {
    return `${num.toFixed(2)}${showUnit ? "元" : ""}`;
  }
}

/**
 * 获取涨跌状态
 * @param value - 涨跌值
 * @returns 状态：'up' | 'down' | 'flat'
 */
export function getTrendStatus(value: number | string): "up" | "down" | "flat" {
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(num)) {
    return "flat";
  }

  if (num > 0) {
    return "up";
  }
  if (num < 0) {
    return "down";
  }
  return "flat";
}

/**
 * 获取涨跌颜色类名
 * @param value - 涨跌值
 * @returns CSS类名
 */
export function getTrendColorClass(value: number | string): string {
  const status = getTrendStatus(value);
  return {
    up: "text-red-500",
    down: "text-green-500",
    flat: "text-gray-500",
  }[status];
}

/**
 * 验证基金代码格式
 * @param code - 基金代码
 * @returns 是否为有效的基金代码
 */
export function isValidFundCode(code: string): boolean {
  // 基金代码通常为6位数字
  return /^\d{6}$/.test(code);
}

/**
 * 计算持仓收益
 * @param shares - 持有份额
 * @param costPrice - 成本价格
 * @param currentPrice - 当前价格
 * @returns 收益信息
 */
export function calculateProfit(
  shares: number,
  costPrice: number,
  currentPrice: number,
): {
  totalCost: number;
  currentValue: number;
  profit: number;
  profitRate: number;
} {
  const totalCost = shares * costPrice;
  const currentValue = shares * currentPrice;
  const profit = currentValue - totalCost;
  const profitRate = totalCost > 0 ? profit / totalCost : 0;

  return {
    totalCost,
    currentValue,
    profit,
    profitRate,
  };
}

/**
 * 格式化基金类型
 * @param type - 基金类型代码
 * @returns 基金类型中文名称
 */
export function formatFundType(type: string): string {
  const typeMap: Record<string, string> = {
    gp: "股票型",
    hh: "混合型",
    zq: "债券型",
    zs: "指数型",
    qdii: "QDII",
    lof: "LOF",
    etf: "ETF",
    fof: "FOF",
  };
  return typeMap[type.toLowerCase()] || "其他";
}

/**
 * 格式化基金风险等级
 * @param level - 风险等级数字
 * @returns 风险等级文字描述
 */
export function formatRiskLevel(level: number): string {
  const riskMap: Record<number, string> = {
    1: "低风险",
    2: "中低风险",
    3: "中风险",
    4: "中高风险",
    5: "高风险",
  };
  return riskMap[level] || "未知";
}
