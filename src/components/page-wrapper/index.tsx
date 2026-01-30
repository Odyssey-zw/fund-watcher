import { Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import "./index.scss";

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
      const systemInfo = Taro.getSystemInfoSync();
      // statusBarHeight 是 px 单位，需要转换为 rpx
      // 1px = 2rpx (假设设计稿是 750rpx = 375px)
      // 优先使用 statusBarHeight，如果没有则使用 safeArea.top
      const statusBarHeight =
        windowInfo.statusBarHeight ??
        systemInfo.statusBarHeight ??
        windowInfo.safeArea?.top ??
        systemInfo.safeArea?.top ??
        0;
      const height = statusBarHeight * 2;
      setTopSafeHeight(Math.max(Number(height) || 0, 0));
    } catch (error) {
      console.warn("Failed to get safe area height:", error);
      setTopSafeHeight(0);
    }
  }, []);

  return (
    <View
      className={`page-wrapper ${className}`}
      style={{
        backgroundColor,
      }}
    >
      {showHeader && title && (
        <View
          className={`page-header ${
            headerStyle === "default" ? "header-default" : "header-centered"
          }`}
          style={{
            top: `${topSafeHeight}rpx`,
          }}
        >
          <Text className="page-title">{title}</Text>
        </View>
      )}
      <View className={`page-content ${contentPadding ? "" : "no-padding"}`}>
        {children}
      </View>
    </View>
  );
}
