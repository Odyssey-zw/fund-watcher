import type { TabKey } from "~/store/types";
import { Tabbar } from "@nutui/nutui-react-taro";
import { BalanceListOutlined, ChartTrendingOutlined, HomeOutlined, UserOutlined } from "@taroify/icons";
import Taro from "@tarojs/taro";
import { GRAY_6, PRIMARY_COLOR } from "~/constants/colors";
import { useAppStore } from "~/store/useAppStore";

const TAB_CONFIG = [
  { key: "home" as TabKey, text: "首页", icon: <HomeOutlined />, path: "/pages/home/index" },
  { key: "fund" as TabKey, text: "基金", icon: <ChartTrendingOutlined />, path: "/pages/fund-list/index" },
  { key: "position" as TabKey, text: "持仓", icon: <BalanceListOutlined />, path: "/pages/position/index" },
  { key: "profile" as TabKey, text: "我的", icon: <UserOutlined />, path: "/pages/profile/index" },
];

export default function AppTabbar() {
  const { activeTabKey, setActiveTabKey } = useAppStore();

  const handleSwitch = (index: number) => {
    const tab = TAB_CONFIG[index];
    if (tab) {
      setActiveTabKey(tab.key);
      Taro.redirectTo({ url: tab.path });
    }
  };

  const activeIndex = TAB_CONFIG.findIndex(tab => tab.key === activeTabKey);

  return (
    <Tabbar
      fixed
      safeArea
      value={activeIndex}
      onSwitch={handleSwitch}
      activeColor={PRIMARY_COLOR}
      inactiveColor={GRAY_6}
      style={{ borderTop: "1px solid #e5e5e5" }}
    >
      {TAB_CONFIG.map(tab => (
        <Tabbar.Item key={tab.key} title={tab.text} icon={tab.icon} />
      ))}
    </Tabbar>
  );
}
