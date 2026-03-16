import { Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import CalendarWidget from "~/components/calendar-widget";
import { APP_VERSION } from "~/constants/app";

export default function HomePage() {
  const [topPadding, setTopPadding] = useState("92rpx"); // 默认值:44px + 48rpx

  useEffect(() => {
    // 获取状态栏高度
    try {
      const windowInfo = Taro.getWindowInfo();
      const statusBarHeight = windowInfo.statusBarHeight ?? 44;
      const padding = statusBarHeight * 2 + 48;
      setTopPadding(`${padding}rpx`);
    } catch (error) {
      console.warn("Failed to get status bar height:", error);
    }
  }, []);

  return (
    <View className="index-page" style={{ height: "100vh", overflow: "hidden" }}>
      <View className="index-page__content" style={{ height: "100%", overflow: "auto" }}>
        <View
          className="min-h-full from-blue-5 to-purple-6 bg-gradient-to-br px-30rpx pb-0"
          style={{
            paddingTop: topPadding,
          }}
        >
          <View className="mb-60rpx pt-40rpx text-center">
            <Text className="mb-20rpx block text-56rpx text-white font-bold">基金监控</Text>
            <Text className="block text-28rpx text-white/80" style={{ letterSpacing: "2rpx" }}>
              Fund Watcher
            </Text>
          </View>

          <View>
            <View className="mb-50rpx rounded-24rpx bg-white/95 p-50rpx px-40rpx text-center shadow-lg">
              <Text className="mb-20rpx block text-36rpx text-gray-8 font-bold">欢迎使用基金监控小程序</Text>
              <Text className="block text-28rpx text-gray-6 leading-relaxed">
                实时监控基金净值变化,管理您的投资组合
              </Text>
            </View>

            <View className="mt-50rpx">
              <CalendarWidget showDetails />
            </View>

            <View className="pb-32rpx pt-40rpx text-center">
              <Text className="text-24rpx text-white/70">v{APP_VERSION}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
