import {
  BalanceListOutlined,
  ChartTrendingOutlined,
  HomeOutlined,
  UserOutlined,
} from "@taroify/icons";
import { ScrollView, Text, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { useEffect, useState } from "react";
import FundList from "~/components/fund-list";
import Home from "~/components/home";
import Position from "~/components/position";
import Profile from "~/components/profile";

const TAB_LIST = [
  {
    key: "home",
    text: "首页",
    icon: HomeOutlined,
    component: Home,
  },
  {
    key: "fund",
    text: "基金",
    icon: ChartTrendingOutlined,
    component: FundList,
  },
  {
    key: "position",
    text: "持仓",
    icon: BalanceListOutlined,
    component: Position,
  },
  {
    key: "profile",
    text: "我的",
    icon: UserOutlined,
    component: Profile,
  },
] as const;

export default function Index() {
  const [activeTab, setActiveTab] = useState<
    "home" | "fund" | "position" | "profile"
  >("home");
  const [bottomPadding, setBottomPadding] = useState("12rpx"); // 默认值
  const [tabBarHeight, setTabBarHeight] = useState("120rpx"); // 底部导航栏高度

  useLoad(() => {
    console.log("Main page loaded");
  });

  useEffect(() => {
    try {
      const windowInfo = Taro.getWindowInfo();

      // 获取底部安全区域高度
      const safeBottom = windowInfo.safeArea?.bottom ?
        (windowInfo.screenHeight - windowInfo.safeArea.bottom) : 0;

      // 转换为 rpx 并加上基础间距
      const padding = safeBottom * 2 + 12;
      const totalHeight = padding + 96; // 图标44rpx + 文字22rpx + 间距30rpx

      setBottomPadding(`${padding}rpx`);
      setTabBarHeight(`${totalHeight}rpx`);
    } catch (error) {
      console.warn("Failed to get safe area:", error);
    }
  }, []);

  const handleTabChange = (key: typeof activeTab) => {
    setActiveTab(key);
  };

  const activeTabConfig = TAB_LIST.find(tab => tab.key === activeTab);
  const ActiveComponent = activeTabConfig?.component || Home;

  return (
    <View className="h-screen flex flex-col bg-white">
      <ScrollView
        className="mb-0 box-border overflow-y-auto"
        scrollY
        style={{ height: `calc(100vh - ${tabBarHeight})` }}
      >
        <ActiveComponent />
      </ScrollView>

      <View
        className="pf bottom-0 left-0 right-0 z-999 box-border w-full flex items-start justify-around bg-white pt-12rpx shadow-[0_-1rpx_0_0_rgba(0,0,0,0.06)]"
        style={{
          paddingBottom: bottomPadding,
        }}
      >
        {TAB_LIST.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <View
              key={tab.key}
              className="pr min-w-0 flex flex-1 flex-col cursor-pointer select-none items-center justify-start overflow-visible p-0"
              onClick={() => handleTabChange(tab.key)}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <Icon
                className={`text-44rpx transition-colors duration-200 flex-shrink-0 block leading-none w-44rpx h-44rpx mb-4rpx ${isActive ? "text-primary-6" : "text-gray-5"}`}
              />
              <Text
                className={`text-22rpx transition-colors duration-200 leading-snug whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-center flex-shrink-0 block ${isActive ? "text-primary-6 font-500" : "text-gray-5"}`}
              >
                {tab.text}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
