/**
 * 基金相关常量
 */

/**
 * 热门基金代码列表
 */
export const HOT_FUND_CODES = [
  "502003",
  "161725",
  "320007",
  "160225",
  "161726",
  "005562",
  "017103",
  "013180",
  "015152",
  "019875",
  "014320",
] as const;

/**
 * 基金 API 接口地址
 */
export const FUND_API_URLS = {
  /** 新浪财经基金实时估值 API 基础地址 */
  SINA_FUND_BASE: "https://fundgz.1234567.com.cn/js",
  /**
   * 获取新浪财经基金实时估值 URL
   * @param fundCode 基金代码
   * @returns 完整的 API URL
   */
  getSinaFundUrl: (fundCode: string) =>
    `${FUND_API_URLS.SINA_FUND_BASE}/${fundCode}.js`,
} as const;
