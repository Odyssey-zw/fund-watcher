# Zustand 状态管理使用指南

本项目使用 Zustand 作为状态管理方案,支持数据持久化到 Taro Storage。

## 📦 Store 结构

```
src/store/
├── types.ts                    # 类型定义
├── middleware/
│   └── persist.ts             # Taro 持久化中间件
├── useAppStore.ts             # 应用全局状态
├── useFundStore.ts            # 基金数据状态
├── usePositionStore.ts        # 用户持仓状态
├── index.ts                   # 统一导出
└── README.md                  # 使用文档
```

## 🎯 三个核心 Store

### 1. useAppStore - 应用全局状态

管理应用级别的配置和状态。

```tsx
import { useAppStore } from "~/store";

function MyComponent() {
  // 获取状态
  const currentTab = useAppStore(state => state.currentTab);
  const theme = useAppStore(state => state.theme);

  // 获取方法
  const setCurrentTab = useAppStore(state => state.setCurrentTab);
  const setTheme = useAppStore(state => state.setTheme);

  return (
    <View>
      <Text>当前标签: {currentTab}</Text>
      <Button onClick={() => setCurrentTab(1)}>切换到标签1</Button>
      <Button onClick={() => setTheme("dark")}>切换暗黑模式</Button>
    </View>
  );
}
```

**状态字段:**
- `currentTab`: 当前选中的 tab 索引
- `showTabBar`: 是否显示底部导航栏
- `theme`: 主题 ("light" | "dark")
- `isFirstLaunch`: 是否首次启动

### 2. useFundStore - 基金数据状态

管理自选基金和搜索历史。

```tsx
import { useFundStore } from "~/store";

function FundList() {
  // 获取自选列表
  const favorites = useFundStore(state => state.favorites);
  const addFavorite = useFundStore(state => state.addFavorite);
  const removeFavorite = useFundStore(state => state.removeFavorite);
  const isFavorite = useFundStore(state => state.isFavorite);

  // 添加自选
  const handleAddFavorite = (fund: FundSearchResult) => {
    addFavorite(fund);
  };

  // 检查是否已自选
  const isInFavorites = isFavorite("000001");

  return (
    <View>
      {favorites.map(fund => (
        <View key={fund.code}>
          <Text>{fund.name}</Text>
          <Button onClick={() => removeFavorite(fund.code)}>移除</Button>
        </View>
      ))}
    </View>
  );
}
```

**搜索历史管理:**

```tsx
function SearchPage() {
  const searchHistory = useFundStore(state => state.searchHistory);
  const addSearchHistory = useFundStore(state => state.addSearchHistory);
  const clearSearchHistory = useFundStore(state => state.clearSearchHistory);

  const handleSearch = (keyword: string) => {
    addSearchHistory(keyword); // 自动去重,最新的在前面
    // 执行搜索...
  };

  return (
    <View>
      {searchHistory.map(keyword => (
        <Text key={keyword}>{keyword}</Text>
      ))}
      <Button onClick={clearSearchHistory}>清空历史</Button>
    </View>
  );
}
```

### 3. usePositionStore - 用户持仓状态

管理用户的基金持仓信息。

```tsx
import { usePositionStore } from "~/store";
import type { FundPosition } from "~/types/fund";

function PositionList() {
  const positions = usePositionStore(state => state.positions);
  const addPosition = usePositionStore(state => state.addPosition);
  const updatePosition = usePositionStore(state => state.updatePosition);
  const removePosition = usePositionStore(state => state.removePosition);
  const getPosition = usePositionStore(state => state.getPosition);

  // 添加持仓
  const handleAddPosition = () => {
    const newPosition: FundPosition = {
      fundCode: "000001",
      fundName: "华夏成长",
      shares: 1000,
      cost: 1.5,
      buyDate: "2024-01-01",
    };
    addPosition(newPosition);
  };

  // 更新持仓
  const handleUpdatePosition = (fundCode: string) => {
    updatePosition(fundCode, {
      currentValue: 1.8,
      marketValue: 1800,
      profit: 300,
      profitRate: 20,
    });
  };

  // 获取单个持仓
  const position = getPosition("000001");

  return (
    <View>
      {positions.map(pos => (
        <View key={pos.fundCode}>
          <Text>{pos.fundName}</Text>
          <Text>持仓: {pos.shares}份</Text>
          <Text>成本: {pos.cost}</Text>
          {pos.profit && <Text>盈亏: {pos.profit}</Text>}
          <Button onClick={() => removePosition(pos.fundCode)}>删除</Button>
        </View>
      ))}
    </View>
  );
}
```

## 🔄 数据持久化

所有 store 的数据都会自动持久化到 Taro Storage:

- **useAppStore**: 存储键 `fund-watcher-app`
- **useFundStore**: 存储键 `fund-watcher-funds`
- **usePositionStore**: 存储键 `fund-watcher-positions`

数据会在以下时机自动保存:
- 每次调用 store 的修改方法时
- 应用切换到后台时

数据会在以下时机自动恢复:
- Store 初始化时
- 应用重新启动时

## 💡 最佳实践

### 1. 选择性订阅

只订阅需要的状态,避免不必要的重渲染:

```tsx
// ✅ 好 - 只订阅需要的字段
const currentTab = useAppStore(state => state.currentTab);

// ❌ 不好 - 订阅整个 store
const appStore = useAppStore();
```

### 2. 组合多个 store

```tsx
function MyComponent() {
  const favorites = useFundStore(state => state.favorites);
  const positions = usePositionStore(state => state.positions);

  // 计算自选但未持仓的基金
  const favoritesNotInPosition = favorites.filter(
    fav => !positions.some(pos => pos.fundCode === fav.code)
  );

  return <View>{/* ... */}</View>;
}
```

### 3. 在非组件中使用

```tsx
import { useAppStore, useFundStore } from "~/store";

// 可以直接调用 store 的方法
export function addToFavorites(fund: FundSearchResult) {
  useFundStore.getState().addFavorite(fund);
}

export function getCurrentTheme() {
  return useAppStore.getState().theme;
}
```

### 4. 批量更新

```tsx
// 一次性设置多个持仓
const positions = await fetchPositionsFromServer();
usePositionStore.getState().setPositions(positions);

// 一次性设置多个自选
const favorites = await fetchFavoritesFromServer();
useFundStore.getState().setFavorites(favorites);
```

## 🎨 TypeScript 支持

所有 store 都有完整的 TypeScript 类型定义:

```tsx
import type { AppState, FundState, PositionState } from "~/store";

// 类型安全的状态访问
const selectCurrentTab = (state: AppState) => state.currentTab;
const currentTab = useAppStore(selectCurrentTab);
```

## 🔧 调试

在开发环境下,可以在控制台查看 store 状态:

```js
// 查看应用状态
console.log(useAppStore.getState());

// 查看基金数据
console.log(useFundStore.getState());

// 查看持仓数据
console.log(usePositionStore.getState());
```

## 📝 注意事项

1. **持久化延迟**: 数据保存是异步的,不会阻塞 UI
2. **存储限制**: 注意小程序 Storage 的大小限制(通常 10MB)
3. **数据迁移**: 如果修改了 store 结构,需要考虑数据迁移策略
4. **敏感数据**: 不要在 store 中存储敏感信息(如 token),应使用加密存储
