/**
 * 财经日历相关类型定义
 */

/**
 * 财经事件类型
 */
export type CalendarEventType = "economic" | "earnings" | "policy" | "holiday" | "other";

/**
 * 重要程度
 */
export type ImportanceLevel = "low" | "medium" | "high";

/**
 * 财经日历事件
 */
export interface CalendarEvent {
  /** 事件ID */
  id: string;
  /** 事件标题 */
  title: string;
  /** 事件日期 */
  date: string;
  /** 事件时间（可选） */
  time?: string;
  /** 事件类型 */
  type: CalendarEventType;
  /** 重要程度 */
  importance: ImportanceLevel;
  /** 事件描述 */
  description?: string;
  /** 前值（经济数据） */
  previous?: string;
  /** 预期值（经济数据） */
  forecast?: string;
  /** 实际值（经济数据） */
  actual?: string;
  /** 相关市场/标的 */
  relatedMarket?: string;
  /** 数据来源 */
  source?: string;
}
