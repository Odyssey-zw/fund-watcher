import { Tabbar } from "@nutui/nutui-react-taro";
import { BalanceListOutlined, ChartTrendingOutlined, HomeOutlined, UserOutlined } from "@taroify/icons";
import { View } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";
import { useState } from "react";
import FundList from "~/components/fund-list";
import Home from "~/components/home";
import Position from "~/components/position";
import Profile from "~/components/profile";
import { GRAY_6, PRIMARY_COLOR } from "~/constants/colors";

const TAB_LIST = [
  { key: "home", text: "首页", icon: <HomeOutlined />, component: Home },
  { key: "fund", text: "基金", icon: <ChartTrendingOutlined />, component: FundList },
  { key: "position", text: "持仓", icon: <BalanceListOutlined />, component: Position },
  { key: "profile", text: "我的", icon: <UserOutlined />, component: Profile },
] as const;

export default function Index() {
  const [activeIndex, setActiveIndex] = useState(1);

  useLoad(() => {
    console.log("Main page loaded");
  });

  const ActiveComponent = TAB_LIST[activeIndex]?.component ?? Home;

  return (
    <View className="index-page" style={{ height: "100vh", overflow: "hidden" }}>
      <View className="index-page__content" style={{ height: "100%", overflow: "auto" }}>
        <ActiveComponent />
      </View>
      <Tabbar
        fixed
        safeArea
        value={activeIndex}
        onSwitch={setActiveIndex}
        activeColor={PRIMARY_COLOR}
        inactiveColor={GRAY_6}
      >
        {TAB_LIST.map(tab => (
          <Tabbar.Item key={tab.key} title={tab.text} icon={tab.icon} />
        ))}
      </Tabbar>
    </View>
  );
}
