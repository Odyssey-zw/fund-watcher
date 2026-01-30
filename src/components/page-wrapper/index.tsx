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
      const height =
        windowInfo.statusBarHeight ?? windowInfo.safeArea?.top ?? 0;
      setTopSafeHeight(Number(height) || 0);
    } catch {
      setTopSafeHeight(0);
    }
  }, []);

  return (
    <View
      className={`page-wrapper ${className}`}
      style={{
        paddingTop: topSafeHeight > 0 ? `${topSafeHeight + 8}px` : undefined,
        backgroundColor,
      }}
    >
      {showHeader && title && (
        <View
          className={`page-header ${
            headerStyle === "default" ? "header-default" : "header-centered"
          }`}
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
