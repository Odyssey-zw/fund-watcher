import { Cell, Switch } from "@nutui/nutui-react-taro";
import { View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import PageWrapper from "~/components/page-wrapper";

interface FundConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  showEstimate: boolean;
  showNotification: boolean;
  sortBy: "unitValue" | "estimate" | "return";
  defaultTab: "all" | "held" | "cleared";
}

const DEFAULT_CONFIG: FundConfig = {
  autoRefresh: true,
  refreshInterval: 30,
  showEstimate: true,
  showNotification: false,
  sortBy: "return",
  defaultTab: "all",
};

const REFRESH_INTERVALS = [
  { label: "15秒", value: 15 },
  { label: "30秒", value: 30 },
  { label: "1分钟", value: 60 },
  { label: "5分钟", value: 300 },
];

const SORT_OPTIONS = [
  { label: "收益率", value: "return" },
  { label: "净值", value: "unitValue" },
  { label: "估值", value: "estimate" },
];

const TAB_OPTIONS = [
  { label: "全部", value: "all" },
  { label: "持有", value: "held" },
  { label: "已清仓", value: "cleared" },
];

export default function FundConfigPage() {
  const [config, setConfig] = useState<FundConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    // 从缓存读取配置
    const cachedConfig = Taro.getStorageSync("fundConfig");
    if (cachedConfig) {
      setConfig({ ...DEFAULT_CONFIG, ...cachedConfig });
    }
  }, []);

  const saveConfig = (newConfig: Partial<FundConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    Taro.setStorageSync("fundConfig", updatedConfig);
    Taro.showToast({
      title: "保存成功",
      icon: "success",
      duration: 1500,
    });
  };

  const handleAutoRefreshChange = (checked: boolean) => {
    saveConfig({ autoRefresh: checked });
  };

  const handleShowEstimateChange = (checked: boolean) => {
    saveConfig({ showEstimate: checked });
  };

  const handleShowNotificationChange = (checked: boolean) => {
    saveConfig({ showNotification: checked });
  };

  const handleRefreshIntervalSelect = () => {
    Taro.showActionSheet({
      itemList: REFRESH_INTERVALS.map(item => item.label),
      success: res => {
        const selected = REFRESH_INTERVALS[res.tapIndex];
        if (selected) {
          saveConfig({ refreshInterval: selected.value });
        }
      },
    });
  };

  const handleSortBySelect = () => {
    Taro.showActionSheet({
      itemList: SORT_OPTIONS.map(item => item.label),
      success: res => {
        const selected = SORT_OPTIONS[res.tapIndex];
        if (selected) {
          saveConfig({ sortBy: selected.value as FundConfig["sortBy"] });
        }
      },
    });
  };

  const handleDefaultTabSelect = () => {
    Taro.showActionSheet({
      itemList: TAB_OPTIONS.map(item => item.label),
      success: res => {
        const selected = TAB_OPTIONS[res.tapIndex];
        if (selected) {
          saveConfig({ defaultTab: selected.value as FundConfig["defaultTab"] });
        }
      },
    });
  };

  const handleResetConfig = () => {
    Taro.showModal({
      title: "确认重置",
      content: "确定要恢复默认配置吗?",
      success: res => {
        if (res.confirm) {
          setConfig(DEFAULT_CONFIG);
          Taro.setStorageSync("fundConfig", DEFAULT_CONFIG);
          Taro.showToast({
            title: "已恢复默认配置",
            icon: "success",
          });
        }
      },
    });
  };

  const getCurrentIntervalLabel = () => {
    return REFRESH_INTERVALS.find(item => item.value === config.refreshInterval)?.label || "30秒";
  };

  const getCurrentSortLabel = () => {
    return SORT_OPTIONS.find(item => item.value === config.sortBy)?.label || "收益率";
  };

  const getCurrentTabLabel = () => {
    return TAB_OPTIONS.find(item => item.value === config.defaultTab)?.label || "全部";
  };

  return (
    <View className="index-page" style={{ height: "100vh", overflow: "hidden" }}>
      <View className="index-page__content" style={{ height: "100%", overflow: "auto" }}>
        <PageWrapper title="基金配置" showHeader showBack headerStyle="centered">
          <View className="mb-16rpx overflow-hidden rd-12rpx bg-white">
            <View className="px-24rpx py-16rpx text-24rpx text-gray-5">基金设置</View>
            <Cell
              title="基金管理"
              description="管理基金代码列表"
              align="center"
              onClick={() => {
                Taro.navigateTo({
                  url: "/pages/fund-manage/index",
                });
              }}
            />
          </View>

          <View className="mb-16rpx overflow-hidden rd-12rpx bg-white">
            <View className="px-24rpx py-16rpx text-24rpx text-gray-5">数据刷新</View>
            <Cell
              title="自动刷新"
              description="自动刷新基金数据"
              align="center"
              extra={<Switch checked={config.autoRefresh} onChange={handleAutoRefreshChange} />}
            />
            <Cell
              title="刷新间隔"
              description={`当前: ${getCurrentIntervalLabel()}`}
              align="center"
              onClick={handleRefreshIntervalSelect}
            />
          </View>

          <View className="mb-16rpx overflow-hidden rd-12rpx bg-white">
            <View className="px-24rpx py-16rpx text-24rpx text-gray-5">显示设置</View>
            <Cell
              title="显示估值"
              description="在列表中显示基金估值"
              align="center"
              extra={<Switch checked={config.showEstimate} onChange={handleShowEstimateChange} />}
            />
            <Cell
              title="消息通知"
              description="收益波动提醒"
              align="center"
              extra={<Switch checked={config.showNotification} onChange={handleShowNotificationChange} />}
            />
          </View>

          <View className="mb-16rpx overflow-hidden rd-12rpx bg-white">
            <View className="px-24rpx py-16rpx text-24rpx text-gray-5">列表设置</View>
            <Cell
              title="默认排序"
              description={`当前: ${getCurrentSortLabel()}`}
              align="center"
              onClick={handleSortBySelect}
            />
            <Cell
              title="默认标签"
              description={`当前: ${getCurrentTabLabel()}`}
              align="center"
              onClick={handleDefaultTabSelect}
            />
          </View>

          <View className="px-24rpx py-16rpx">
            <View
              className="w-full cursor-pointer rd-12rpx bg-primary-1 py-24rpx text-center text-28rpx text-primary-6"
              onClick={handleResetConfig}
            >
              恢复默认配置
            </View>
          </View>
        </PageWrapper>
      </View>
    </View>
  );
}
