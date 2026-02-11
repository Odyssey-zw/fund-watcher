/**
 * 基金内部 API（供其他模块使用）
 */

import Taro from "@tarojs/taro";
import { FUND_API_URLS } from "~/constants/fund";

/** 新浪财经基金接口返回的 JSON 结构（jsonpgz 回调参数） */
export interface SinaFundData {
  fundcode?: string;
  name?: string;
  jzrq?: string; // 净值日期
  dwjz?: string; // 单位净值
  gsz?: string; // 估算净值
  gszzl?: string; // 估算涨跌幅（如 "0.12" 表示 0.12%）
  gztime?: string; // 估值时间
  [key: string]: unknown;
}

/**
 * 从新浪财经获取单个基金数据
 * @param fundCode 基金代码（如：005911）
 * @returns 基金实时数据，失败返回 null
 */
export async function getSinaFundData(fundCode: string): Promise<SinaFundData | null> {
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
