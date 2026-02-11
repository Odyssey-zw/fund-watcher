import { ScrollView, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { createContext, useContext, useEffect, useState } from "react";

interface PageLayoutInfo {
  topSafeHeight: number; // 顶部安全区域高度（rpx）
  headerHeight: number; // 标题栏高度（rpx），默认88
  bottomTabBarHeight: number; // 底部导航栏高度（rpx）
  contentTopOffset: number; // 内容区域顶部偏移（rpx）= topSafeHeight + headerHeight
  scrollViewHeight: string; // ScrollView 高度计算字符串
}

const PageLayoutContext = createContext<PageLayoutInfo | null>(null);

export function usePageLayout() {
  const context = useContext(PageLayoutContext);
  if (!context) {
    throw new Error("usePageLayout must be used within PageWrapper");
  }
  return context;
}

interface PageWrapperProps {
  title?: string;
  showHeader?: boolean;
  headerStyle?: "default" | "centered";
  children: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  contentPadding?: boolean;
  enableScroll?: boolean; // 是否启用滚动，默认true
}

export default function PageWrapper({
  title,
  showHeader = false,
  headerStyle = "centered",
  children,
  className = "",
  backgroundColor = "#fff",
  contentPadding = true,
  enableScroll = true,
}: PageWrapperProps) {
  const [topSafeHeight, setTopSafeHeight] = useState(0);
  const [bottomTabBarHeight, setBottomTabBarHeight] = useState(120);

  useEffect(() => {
    try {
      const windowInfo = Taro.getWindowInfo();
      // statusBarHeight 是 px 单位，需要转换为 rpx
      // 1px = 2rpx (假设设计稿是 750rpx = 375px)
      // 优先使用 statusBarHeight，如果没有则使用 safeArea.top
      const statusBarHeight = windowInfo.statusBarHeight ?? windowInfo.safeArea?.top ?? 0;
      const height = statusBarHeight * 2;
      setTopSafeHeight(Math.max(Number(height) || 0, 0));

      // 获取底部安全区域高度
      const safeBottom = windowInfo.safeArea?.bottom ? windowInfo.screenHeight - windowInfo.safeArea.bottom : 0;
      const padding = safeBottom * 2 + 12;
      const totalHeight = padding + 96; // 图标44rpx + 文字22rpx + 间距30rpx
      setBottomTabBarHeight(totalHeight);
    } catch (error) {
      console.warn("Failed to get safe area height:", error);
      setTopSafeHeight(0);
      setBottomTabBarHeight(120);
    }
  }, []);

  const headerHeight = 88; // 标题栏高度（rpx）
  const contentTopOffset = topSafeHeight + (showHeader ? headerHeight : 0);
  const scrollViewHeight = `calc(100vh - ${topSafeHeight + (showHeader ? headerHeight : 0) + bottomTabBarHeight}rpx)`;

  const layoutInfo: PageLayoutInfo = {
    topSafeHeight,
    headerHeight: showHeader ? headerHeight : 0,
    bottomTabBarHeight,
    contentTopOffset,
    scrollViewHeight,
  };

  // 计算中间内容区域的固定高度和顶部偏移
  const headerTotalHeight = showHeader ? headerHeight : 0;
  const contentAreaTop = topSafeHeight + headerTotalHeight;
  const contentAreaHeight = `calc(100vh - ${topSafeHeight + headerTotalHeight + bottomTabBarHeight}rpx)`;

  return (
    <PageLayoutContext.Provider value={layoutInfo}>
      <View
        className={`p-0 box-border ${className}`}
        style={{
          backgroundColor,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* 固定头部 */}
        {showHeader && title && (
          <View
            className={`pf left-0 right-0 flex items-center ${
              headerStyle === "default" ? "justify-start !px-30rpx" : "justify-center text-center"
            } h-88rpx bg-white border-b border-gray-3 z-100`}
            style={{
              top: `${topSafeHeight}rpx`,
              paddingLeft: "env(safe-area-inset-left, 0px)",
              paddingRight: "env(safe-area-inset-right, 0px)",
            }}
          >
            <Text className="flex items-center justify-center text-36rpx text-gray-8 font-600 leading-none">
              {title}
            </Text>
          </View>
        )}

        {/* 中间内容区域 - 固定高度，可滚动 */}
        <View
          className="box-border"
          style={{
            marginTop: `${contentAreaTop}rpx`,
            height: contentAreaHeight,
            overflow: "hidden",
          }}
        >
          {enableScroll ? (
            <ScrollView className="box-border h-full w-full" scrollY>
              <View className={`box-border ${contentPadding ? "p-30rpx" : "p-0"}`}>{children}</View>
            </ScrollView>
          ) : (
            <View className={`box-border w-full h-full overflow-hidden ${contentPadding ? "p-30rpx" : "p-0"}`}>
              {children}
            </View>
          )}
        </View>
      </View>
    </PageLayoutContext.Provider>
  );
}
