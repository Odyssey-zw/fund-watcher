/**
 * 环境变量工具函数
 */

/**
 * 获取环境变量
 * @param key - 环境变量键
 * @param defaultValue - 默认值
 * @returns 环境变量值
 */
export function getEnv(key: string, defaultValue?: string): string {
  return process.env[key] || defaultValue || "";
}

/**
 * 检查是否为开发环境
 */
export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * 检查是否为生产环境
 */
export function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * 检查是否为测试环境
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === "test";
}

/**
 * 获取当前运行环境
 */
export function getCurrentEnv(): string {
  return getEnv("TARO_APP_ENV", "dev");
}

/**
 * 获取API基础URL
 */
export function getApiBaseUrl(): string {
  return getEnv("TARO_APP_API_URL", "https://api.fundwatcher.com");
}

/**
 * 检查是否开启调试模式
 */
export function isDebugEnabled(): boolean {
  return getEnv("TARO_APP_DEBUG", "false") === "true";
}
