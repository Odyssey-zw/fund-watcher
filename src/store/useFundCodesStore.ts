/**
 * 基金代码列表状态管理
 * 用于管理全局的基金代码列表
 */
import { create } from "zustand";
import { HOT_FUND_CODES } from "~/constants/fund";
import { createTaroPersist } from "./middleware/persist";

export interface FundCodeItem {
  code: string;
  name?: string; // 基金名称，首次添加时可能为空，后续获取
  addTime: number; // 添加时间戳
  tagKeys?: string[]; // 关联的多个标签 key
}

export interface FundTagItem {
  key: string;
  value: string;
}

interface FundCodesState {
  fundCodes: FundCodeItem[];
  tags: FundTagItem[];

  // 获取所有基金代码（仅代码字符串数组）
  getFundCodes: () => string[];

  // 添加基金代码
  addFundCode: (code: string, name?: string) => void;

  // 批量添加基金代码
  addFundCodes: (codes: string[]) => void;

  // 删除基金代码
  removeFundCode: (code: string) => void;

  // 更新基金名称
  updateFundName: (code: string, name: string) => void;

  // 更新基金标签（支持多个）
  updateFundTags: (code: string, tagKeys: string[]) => void;

  // 重置为默认列表
  resetToDefault: () => void;

  // 检查基金代码是否存在
  hasFundCode: (code: string) => boolean;

  // 标签相关
  addTag: (tag: FundTagItem) => void;
  updateTag: (oldKey: string, tag: FundTagItem) => void;
  removeTag: (key: string) => void;
  hasTagKey: (key: string) => boolean;
}

function getDefaultFundCodes(): FundCodeItem[] {
  return HOT_FUND_CODES.map(code => ({
    code,
    name: undefined,
    addTime: Date.now(),
    tagKeys: [],
  }));
}

export const useFundCodesStore = create<FundCodesState>(
  createTaroPersist(
    (set, get) => ({
      fundCodes: getDefaultFundCodes(),
      tags: [],

      getFundCodes: () => {
        return get().fundCodes.map(item => item.code);
      },

      addFundCode: (code, name) => {
        set(state => {
          // 检查是否已存在
          if (state.fundCodes.some(item => item.code === code)) {
            console.warn(`基金代码 ${code} 已存在`);
            return state;
          }

          return {
            fundCodes: [
              ...state.fundCodes,
              {
                code,
                name,
                addTime: Date.now(),
                tagKeys: [],
              },
            ],
          };
        });
      },

      addFundCodes: codes => {
        set(state => {
          const existingCodes = new Set(state.fundCodes.map(item => item.code));
          const newItems = codes
            .filter(code => !existingCodes.has(code))
            .map(code => ({
              code,
              name: undefined,
              addTime: Date.now(),
              tagKeys: [],
            }));

          if (newItems.length === 0) {
            return state;
          }

          return {
            fundCodes: [...state.fundCodes, ...newItems],
          };
        });
      },

      removeFundCode: code => {
        set(state => ({
          fundCodes: state.fundCodes.filter(item => item.code !== code),
        }));
      },

      updateFundName: (code, name) => {
        set(state => ({
          fundCodes: state.fundCodes.map(item => (item.code === code ? { ...item, name } : item)),
        }));
      },

      updateFundTags: (code, tagKeys) => {
        set(state => ({
          fundCodes: state.fundCodes.map(item => (item.code === code ? { ...item, tagKeys } : item)),
        }));
      },

      resetToDefault: () => {
        set({
          fundCodes: getDefaultFundCodes(),
        });
      },

      hasFundCode: code => {
        return get().fundCodes.some(item => item.code === code);
      },

      addTag: tag => {
        set(state => {
          if (state.tags.some(t => t.key === tag.key)) {
            console.warn(`标签 key ${tag.key} 已存在`);
            return state;
          }
          return { tags: [...state.tags, tag] };
        });
      },

      updateTag: (oldKey, tag) => {
        set(state => ({
          tags: state.tags.map(t => (t.key === oldKey ? tag : t)),
          fundCodes:
            oldKey === tag.key
              ? state.fundCodes
              : state.fundCodes.map(f =>
                  f.tagKeys?.includes(oldKey) ? { ...f, tagKeys: f.tagKeys.map(k => (k === oldKey ? tag.key : k)) } : f,
                ),
        }));
      },

      removeTag: key => {
        set(state => ({
          tags: state.tags.filter(t => t.key !== key),
          fundCodes: state.fundCodes.map(f =>
            f.tagKeys?.includes(key) ? { ...f, tagKeys: f.tagKeys.filter(k => k !== key) } : f,
          ),
        }));
      },

      hasTagKey: key => {
        return get().tags.some(t => t.key === key);
      },
    }),
    {
      name: "fund-watcher-fund-codes",
    },
  ),
);
