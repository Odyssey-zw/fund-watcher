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
import "./index.scss";

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
    <View className="main-page">
      <ScrollView className="main-content" scrollY>
        <ActiveComponent />
      </ScrollView>

      <View className="tab-bar">
        {TAB_LIST.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <View
              key={tab.key}
              className={`tab-item ${isActive ? "active" : ""}`}
              onClick={() => handleTabChange(tab.key)}
            >
              <Icon className="tab-icon" />
              <Text className="tab-text">{tab.text}</Text>
              {isActive && <View className="tab-indicator" />}
            </View>
          );
        })}
      </View>
    </View>
  );
}
