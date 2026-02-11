import type { StateCreator, StoreApi } from "zustand";
/**
 * Zustand 持久化中间件 - Taro 适配版
 */
import Taro from "@tarojs/taro";

interface PersistOptions<T> {
  name: string;
  partialize?: (state: T) => Partial<T>;
}

/**
 * 创建 Taro Storage 持久化中间件
 */
export function createTaroPersist<T>(config: StateCreator<T>, options: PersistOptions<T>) {
  return (set: StoreApi<T>["setState"], get: StoreApi<T>["getState"], api: StoreApi<T>): T => {
    const { name, partialize } = options;

    // 从 Storage 恢复状态
    const restoreState = async () => {
      try {
        const storedValue = await Taro.getStorage({ key: name });
        if (storedValue.data) {
          const state = typeof storedValue.data === "string" ? JSON.parse(storedValue.data) : storedValue.data;
          set(state, true);
        }
      } catch (error) {
        console.warn(`Failed to restore state from ${name}:`, error);
      }
    };

    // 保存状态到 Storage
    const saveState = async (state: T) => {
      try {
        const stateToSave = partialize ? partialize(state) : state;
        await Taro.setStorage({
          key: name,
          data: JSON.stringify(stateToSave),
        });
      } catch (error) {
        console.error(`Failed to save state to ${name}:`, error);
      }
    };

    // 初始化时恢复状态
    restoreState();

    // 包装 set 方法,在每次状态更新时保存
    const wrappedSet: typeof set = (partial, replace) => {
      set(partial, replace);
      const state = get();
      saveState(state);
    };

    return config(wrappedSet, get, api);
  };
}
