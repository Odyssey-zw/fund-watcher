/**
 * 应用版本号，构建时由 config 从 package.json 注入全局 __VERSION__（勿用 process.env，小程序/浏览器无 process）
 */
export const APP_VERSION = __VERSION__ || "0.0.0";
