import {
  BalanceListOutlined,
  ChartTrendingOutlined,
  HomeOutlined,
  UserOutlined,
} from "@taroify/icons";
import { ScrollView, Text, View } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";
import { useState } from "react";
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

  useLoad(() => {
    console.log("Main page loaded");
  });

  const handleTabChange = (key: typeof activeTab) => {
    setActiveTab(key);
  };

  const activeTabConfig = TAB_LIST.find(tab => tab.key === activeTab);
  const ActiveComponent = activeTabConfig?.component || Home;

  return (
    <View className="h-screen flex flex-col bg-white">
      <ScrollView className="mb-0 box-border flex-1 overflow-y-auto" scrollY>
        <ActiveComponent />
      </ScrollView>

      <View
        className="pf bottom-0 left-0 right-0 z-999 box-border w-full flex items-start justify-around bg-white pt-12rpx shadow-[0_-1rpx_0_0_rgba(0,0,0,0.06)]"
        style={{
          paddingBottom: "calc(constant(safe-area-inset-bottom, 0px) + 12rpx)",
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
