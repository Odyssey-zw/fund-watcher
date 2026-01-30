import createCache from "~/utils/cache";

export * from "./env";
// 基金相关工具函数
export * from "./fundUtils";
export * from "./typeChecks";
export { createCache };

export * from "./updateVersion";

// 系统信息相关
export interface SystemInfo {
  platform: string;
  version: string;
  screenWidth: number;
  screenHeight: number;
  windowWidth: number;
  windowHeight: number;
  pixelRatio: number;
  statusBarHeight: number;
  safeArea: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
    height: number;
  };
}

/**
 * 异步获取并缓存系统信息（使用新的 API）
 */
export async function fetchAndCacheSystemInfoAsync(): Promise<SystemInfo> {
  const Taro = await import("@tarojs/taro");
  // 使用新的 API 替代已废弃的 getSystemInfo
  const windowInfo = Taro.getWindowInfo();
  const deviceInfo = Taro.getDeviceInfo();
  const appBaseInfo = Taro.getAppBaseInfo();

  // 组合新的 API 数据为兼容的 SystemInfo 格式
  const sysInfo: SystemInfo = {
    platform: deviceInfo.platform || "unknown",
    version: appBaseInfo.version || "",
    screenWidth: windowInfo.screenWidth,
    screenHeight: windowInfo.screenHeight,
    windowWidth: windowInfo.windowWidth,
    windowHeight: windowInfo.windowHeight,
    pixelRatio: windowInfo.pixelRatio,
    statusBarHeight: windowInfo.statusBarHeight ?? 0,
    safeArea: windowInfo.safeArea || {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: windowInfo.windowWidth,
      height: windowInfo.windowHeight,
    },
  };

  const { cache } = await import("~/cache");
  await cache.set("sysInfo", sysInfo);
  return sysInfo;
}
