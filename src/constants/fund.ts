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

  "008114",
  "014028",
  "001466",
  "001900",
  "022286",
  "022365",
  "022364",
  "011840",
  "016531",
  "017103",
  "018125",
  "017193",
  "016371",
  "020608",
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
  getSinaFundUrl: (fundCode: string) => `${FUND_API_URLS.SINA_FUND_BASE}/${fundCode}.js`,

  /** 东财历史净值 API 基础地址（返回 HTML 表格或 apidata 对象） */
  EASTMONEY_HISTORY_BASE: "https://fund.eastmoney.com/f10/F10DataApi.aspx",
  /**
   * 获取东财历史净值 URL（按需可限制 per、sdate/edate）
   * @param fundCode 基金代码
   * @param per 返回条数，默认 4000（足够覆盖大多周期）
   */
  getEastmoneyHistoryUrl: (fundCode: string, per = 4000) =>
    `${FUND_API_URLS.EASTMONEY_HISTORY_BASE}?type=lsjz&code=${fundCode}&page=1&per=${per}&sdate=&edate=`,

  /** 东财基金详情 pingzhongdata 接口基础地址 */
  EASTMONEY_DETAIL_BASE: "https://fund.eastmoney.com/pingzhongdata",
  /**
   * 获取东财基金详情 URL（JS 格式，包含经理、规模、成立日期等）
   * @param fundCode 基金代码
   */
  getEastmoneyDetailUrl: (fundCode: string) => `${FUND_API_URLS.EASTMONEY_DETAIL_BASE}/${fundCode}.js?v=${Date.now()}`,
} as const;
