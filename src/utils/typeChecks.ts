/**
 * 类型检查工具函数
 */

/**
 * 检查值是否为null或undefined
 */
export function isNullOrUndefined(value: any): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * 检查值是否不为null或undefined
 */
export function isNotNullOrUndefined<T>(
  value: T | null | undefined,
): value is T {
  return !isNullOrUndefined(value);
}

/**
 * 检查值是否为字符串
 */
export function isString(value: any): value is string {
  return typeof value === "string";
}

/**
 * 检查值是否为数字
 */
export function isNumber(value: any): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

/**
 * 检查值是否为布尔值
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === "boolean";
}

/**
 * 检查值是否为数组
 */
export function isArray(value: any): value is Array<any> {
  return Array.isArray(value);
}

/**
 * 检查值是否为对象
 */
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * 检查值是否为函数
 */
export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === "function";
}

/**
 * 检查字符串是否为空
 */
export function isEmpty(value: string | null | undefined): boolean {
  return isNullOrUndefined(value) || value.trim() === "";
}

/**
 * 检查数组是否为空
 */
export function isEmptyArray(value: any[]): boolean {
  return !isArray(value) || value.length === 0;
}

/**
 * 检查对象是否为空
 */
export function isEmptyObject(value: Record<string, any>): boolean {
  return !isObject(value) || Object.keys(value).length === 0;
}
