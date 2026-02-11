import type { FundSearchResult } from "~/types/fund";
import { Table } from "@nutui/nutui-react-taro";
import { Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getHotFunds } from "~/api/fund";
import PageWrapper from "~/components/page-wrapper";
import { formatFundValue, formatPercentage } from "~/utils/fundUtils";

/** 顶部 Tab 选项 */
const TABS = [
  { key: "all", label: "全部" },
  { key: "held", label: "持有" },
  { key: "cleared", label: "已清仓" },
] as const;

/** 获取涨跌颜色 */
function getTrendColor(value?: number) {
  if (value == null || value === 0) {
    return "#666";
  }
  return value > 0 ? "#f5222d" : "#52c41a";
}

export default function FundList() {
  const [funds, setFunds] = useState<FundSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"unitValue" | "estimate" | "return">("return");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const loadFunds = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await getHotFunds({ page: 1, pageSize: 1000 });
      if (response.success) {
        setFunds((response.data.list as FundSearchResult[]) || []);
      } else {
        setFunds([]);
      }
    } catch {
      setFunds([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadFunds(true);
  }, [loadFunds]);

  // 30 秒静默刷新（API 层有 30s 缓存，会复用数据）
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadFunds(false);
    }, 30_000);
    return () => clearInterval(intervalId);
  }, [loadFunds]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const displayedFunds = useMemo(() => {
    let list = [...funds];

    if (activeTab === "held") {
      list = list.filter(f => f.tags?.includes("持有"));
    } else if (activeTab === "cleared") {
      list = list.filter(f => !f.tags?.includes("持有"));
    } else if (activeTab !== "all" && ["gp", "zq", "zs"].includes(activeTab)) {
      list = list.filter(f => f.type === activeTab);
    }

    const order = sortOrder === "asc" ? 1 : -1;
    return list.sort((a, b) => {
      let aVal: number | undefined;
      let bVal: number | undefined;
      if (sortBy === "unitValue") {
        aVal = a.unitValue ?? 0;
        bVal = b.unitValue ?? 0;
      } else if (sortBy === "estimate") {
        aVal = a.estimateValue ?? 0;
        bVal = b.estimateValue ?? 0;
      } else {
        aVal = a.returnAfterAddition ?? 0;
        bVal = b.returnAfterAddition ?? 0;
      }
      return (aVal - bVal) * order;
    });
  }, [funds, activeTab, sortBy, sortOrder]);

  // Table 列配置
  const columns = [
    {
      title: "基金名称",
      key: "name",
      align: "left",
      // fixed: "left",
      width: 200,
      render: (record: FundSearchResult) => (
        <View
          className="flex flex-col gap-4rpx"
          onClick={() =>
            Taro.navigateTo({
              url: `/pages/fund-detail/index?code=${record.code}`,
            })
          }
        >
          <Text className="text-28rpx text-gray-8 font-500">{record.name}</Text>
          <Text className="text-22rpx text-gray-5">{record.code}</Text>
        </View>
      ),
    },
    {
      title: "净值",
      key: "unitValue",
      align: "right",
      sorter: true,
      render: (record: FundSearchResult) => (
        <View className="flex flex-col items-end gap-4rpx">
          <Text className="text-26rpx font-500">{formatFundValue(record.unitValue ?? 0)}</Text>
          <Text className="text-22rpx" style={{ color: getTrendColor(record.dayGrowthRate) }}>
            {record.dayGrowthRate != null ? formatPercentage(record.dayGrowthRate) : "--"}
          </Text>
        </View>
      ),
    },
    {
      title: "估值",
      key: "estimate",
      align: "right",
      sorter: true,
      render: (record: FundSearchResult) => (
        <View className="flex flex-col items-end gap-4rpx">
          <Text className="text-26rpx font-500">
            {record.estimateValue != null ? formatFundValue(record.estimateValue) : "--"}
          </Text>
          <Text className="text-22rpx" style={{ color: getTrendColor(record.estimateChange) }}>
            {record.estimateChange != null ? formatPercentage(record.estimateChange) : "--"}
          </Text>
        </View>
      ),
    },
  ];

  return (
    <PageWrapper
      title="基金列表"
      showHeader
      headerStyle="centered"
      showTabBar={true}
      tabBarHeight={88}
      contentPadding={false}
    >
      <View className="px-20rpx py-20rpx">
        {/* Tab 切换 */}
        <View className="mb-20rpx flex gap-20rpx">
          {TABS.map(tab => (
            <View
              key={tab.key}
              className={`cursor-pointer px-24rpx py-12rpx text-28rpx transition-colors ${
                activeTab === tab.key ? "border-b-2 border-primary-6 font-500 text-primary-6" : "text-gray-6"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text>{tab.label}</Text>
            </View>
          ))}
        </View>

        {/* Table */}
        {loading ? (
          <View className="p-40rpx text-center text-gray-5">
            <Text>加载中...</Text>
          </View>
        ) : (
          <Table
            columns={columns}
            data={displayedFunds}
            bordered={false}
            noData={<Text>暂无基金数据</Text>}
            onSort={item => {
              if (item.key === "unitValue") {
                handleSort("unitValue");
              } else if (item.key === "estimate") {
                handleSort("estimate");
              }
            }}
          />
        )}
      </View>
    </PageWrapper>
  );
}
