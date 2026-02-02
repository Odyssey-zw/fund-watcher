import { Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";

interface PageWrapperProps {
  title?: string;
  showHeader?: boolean;
  headerStyle?: "default" | "centered";
  children: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  contentPadding?: boolean;
}

export default function PageWrapper({
  title,
  showHeader = false,
  headerStyle = "centered",
  children,
  className = "",
  backgroundColor = "#fff",
  contentPadding = true,
}: PageWrapperProps) {
  const [topSafeHeight, setTopSafeHeight] = useState(0);

  useEffect(() => {
    try {
      const windowInfo = Taro.getWindowInfo();
      // statusBarHeight 是 px 单位，需要转换为 rpx
      // 1px = 2rpx (假设设计稿是 750rpx = 375px)
      // 优先使用 statusBarHeight，如果没有则使用 safeArea.top
      const statusBarHeight =
        windowInfo.statusBarHeight ?? windowInfo.safeArea?.top ?? 0;
      const height = statusBarHeight * 2;
      setTopSafeHeight(Math.max(Number(height) || 0, 0));
    } catch (error) {
      console.warn("Failed to get safe area height:", error);
      setTopSafeHeight(0);
    }
  }, []);

  return (
    <View
      className={`min-h-full p-0 box-border ${className}`}
      style={{
        backgroundColor,
      }}
    >
      {showHeader && title && (
        <View
          className={`pf left-0 right-0 flex items-center ${
            headerStyle === "default"
              ? "justify-start px-30rpx"
              : "justify-center text-center"
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
      <View
        className={`min-h-[calc(100vh-88rpx)] box-border ${contentPadding ? "p-30rpx" : "p-0"}`}
      >
        {children}
      </View>
    </View>
  );
}
