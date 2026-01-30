/**
 * 通用类型定义
 */

/**
 * API 响应格式
 */
export interface ApiResponse<T = any> {
  /** 状态码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: T;
  /** 是否成功 */
  success: boolean;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  /** 页码，从1开始 */
  page: number;
  /** 每页数量 */
  pageSize: number;
}

/**
 * 分页响应数据
 */
export interface PaginationResult<T> {
  /** 数据列表 */
  list: T[];
  /** 总数量 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * 通用状态枚举
 */
export enum CommonStatus {
  /** 启用 */
  ENABLED = 1,
  /** 禁用 */
  DISABLED = 0,
}

/**
 * 涨跌状态
 */
export type TrendStatus = "up" | "down" | "flat";

/**
 * 基础实体类型
 */
export interface BaseEntity {
  /** ID */
  id: string;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
}

/**
 * 用户信息
 */
export interface UserInfo {
  /** 用户ID */
  id: string;
  /** 昵称 */
  nickname: string;
  /** 头像 */
  avatar: string;
  /** 手机号 */
  phone?: string;
  /** 邮箱 */
  email?: string;
}
