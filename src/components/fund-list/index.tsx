import type { FundSearchResult } from "~/types/fund";
import { ArrowDown, ArrowUp } from "@taroify/icons";
import { ScrollView, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useMemo, useState } from "react";
import { getHotFunds } from "~/api/fund";
import PageWrapper, { usePageLayout } from "~/components/page-wrapper";
import { formatFundValue, formatPercentage, getTrendColorStyle } from "~/utils/fundUtils";

/** 顶部 Tab 选项 */
const TABS = [
  { key: "all", label: "全部" },
  { key: "held", label: "持有" },
  { key: "cleared", label: "已清仓" },
] as const;

/** 净值/估值日期展示用 */
function formatDateLabel(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function FundList() {
  const [funds, setFunds] = useState<FundSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"unitValue" | "estimate" | "return">("return");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const loadFunds = async (page: number = currentPage, showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await getHotFunds({ page, pageSize: 20 });
      if (response.success) {
        if (page === 1) {
          setFunds((response.data.list as FundSearchResult[]) || []);
        } else {
          setFunds(prev => [...prev, ...((response.data.list as FundSearchResult[]) || [])]);
        }
        setHasMore(response.data.page < response.data.totalPages);
      } else {
        if (page === 1) {
          setFunds([]);
        }
      }
    } catch {
      if (page === 1) {
        setFunds([]);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadFunds(1);
  }, []);

  // 每30秒自动刷新数据
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadFunds(1, false); // 不显示加载状态，静默刷新
    }, 30000); // 30秒 = 30000毫秒

    // 组件卸载时清理定时器
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (currentPage > 1) {
      loadFunds(currentPage);
    }
  }, [currentPage]);

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

  const handleReachBottom = () => {
    if (hasMore && !loading) {
      setCurrentPage(p => p + 1);
    }
  };

  return (
    <PageWrapper
      title="基金列表"
      showHeader
      headerStyle="centered"
      showTabBar={true}
      tabBarHeight={88}
      contentPadding={false}
      enableScroll={false}
    >
      <FundListContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        displayedFunds={displayedFunds}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleSort={handleSort}
        handleReachBottom={handleReachBottom}
        formatDateLabel={formatDateLabel}
      />
    </PageWrapper>
  );
}

function FundListContent({
  activeTab,
  setActiveTab,
  displayedFunds,
  loading,
  sortBy,
  sortOrder,
  handleSort,
  handleReachBottom,
  formatDateLabel,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  displayedFunds: FundSearchResult[];
  loading: boolean;
  sortBy: "unitValue" | "estimate" | "return";
  sortOrder: "asc" | "desc";
  handleSort: (field: "unitValue" | "estimate" | "return") => void;
  handleReachBottom: () => void;
  formatDateLabel: (offsetDays: number) => string;
}) {
  const layoutInfo = usePageLayout();

  return (
    <View className="p-0">
      {/* 固定标签栏 */}
      <View
        className="pf left-0 right-0 z-99 flex flex-nowrap items-center overflow-x-auto border-b border-gray-200 bg-white py-24rpx pl-24rpx"
        style={{
          top: `${layoutInfo.topSafeHeight + layoutInfo.headerHeight}rpx`,
          paddingLeft: "calc(24rpx + env(safe-area-inset-left, 0px))",
          paddingRight: "calc(24rpx + env(safe-area-inset-right, 0px))",
        }}
      >
        {TABS.map(tab => (
          <View
            key={tab.key}
            className={`flex-shrink-0 pt-12rpx px-28rpx mr-16rpx text-28rpx pr cursor-pointer transition-colors duration-200 ${
              activeTab === tab.key
                ? "text-primary-6 font-500 relative after:content-[''] after:absolute after:left-1/2 after:bottom-[-24rpx] after:transform after:-translate-x-1/2 after:w-40rpx after:h-4rpx after:bg-primary-6 after:rounded-2rpx"
                : "text-gray-6"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      {/* 内容区域 - 固定高度 ScrollView */}
      <View
        style={{
          height: layoutInfo.scrollViewHeight,
          overflow: "hidden",
        }}
      >
        <ScrollView
          className="fund-list-container"
          scrollY
          onScrollToLower={handleReachBottom}
          style={{
            height: "100%",
          }}
        >
          {loading ? (
            <View className="p-40rpx text-center text-gray-5">
              <Text>加载中...</Text>
            </View>
          ) : displayedFunds.length > 0 ? (
            <ScrollView className="w-full" scrollX>
              <View className="h-72rpx min-w-600rpx flex items-center border-b border-gray-200 bg-gray-100 px-20rpx py-12rpx text-22rpx text-gray-5">
                <View className="mr-16rpx h-full max-w-1/2 min-w-0 w-1/2 flex flex-shrink-0 flex-grow-0 items-center">
                  <View>
                    <View>基金名称</View>
                  </View>
                </View>
                <View
                  className="mr-16rpx w-120rpx flex flex-shrink-0 cursor-pointer items-center justify-end gap-4rpx"
                  onClick={() => handleSort("unitValue")}
                >
                  <View>
                    <View>净值</View>
                    <View className="text-18rpx text-gray-4 leading-tight">{formatDateLabel(1)}</View>
                  </View>
                  {sortBy === "unitValue" ? sortOrder === "desc" ? <ArrowDown /> : <ArrowUp /> : null}
                </View>
                <View
                  className="mr-16rpx w-120rpx flex flex-shrink-0 cursor-pointer items-center justify-end gap-4rpx"
                  onClick={() => handleSort("estimate")}
                >
                  <View>
                    <View>估值</View>
                    <View className="text-18rpx text-gray-4 leading-tight">{formatDateLabel(0)}</View>
                  </View>
                  {sortBy === "estimate" ? sortOrder === "desc" ? <ArrowDown /> : <ArrowUp /> : null}
                </View>
              </View>
              <View>
                {displayedFunds.map(fund => (
                  <View
                    key={fund.code}
                    className="min-w-600rpx flex cursor-pointer items-center border-b border-gray-200 bg-white px-20rpx py-14rpx transition-colors duration-200 active:bg-gray-50"
                    onClick={() =>
                      Taro.navigateTo({
                        url: `/pages/fund-detail/index?code=${fund.code}`,
                      })
                    }
                  >
                    <View className="mr-16rpx max-w-1/2 min-w-0 w-1/2 flex flex-shrink-0 flex-grow-0 flex-col items-start justify-center overflow-hidden">
                      <Text className="mb-2rpx w-full overflow-hidden text-ellipsis whitespace-nowrap text-26rpx text-gray-8 font-500 leading-tight">
                        {fund.name}
                      </Text>
                      <Text className="text-22rpx text-gray-5 leading-tight">{fund.code}</Text>
                    </View>
                    <View className="min-w-0 flex flex-1 items-center">
                      <View className="mr-16rpx w-120rpx flex flex-shrink-0 flex-col items-end justify-center">
                        <Text className="mb-0 text-26rpx font-500 leading-tight">
                          {formatFundValue(fund.unitValue ?? 0)}
                        </Text>
                        <Text className="text-22rpx leading-tight" style={getTrendColorStyle(fund.dayGrowthRate ?? 0)}>
                          {fund.dayGrowthRate != null ? formatPercentage(fund.dayGrowthRate) : "--"}
                        </Text>
                      </View>
                      <View className="mr-16rpx w-120rpx flex flex-shrink-0 flex-col items-end justify-center">
                        <Text className="mb-0 text-26rpx font-500 leading-tight">
                          {fund.estimateValue != null ? formatFundValue(fund.estimateValue) : "--"}
                        </Text>
                        <Text className="text-22rpx leading-tight" style={getTrendColorStyle(fund.estimateChange ?? 0)}>
                          {fund.estimateChange != null ? formatPercentage(fund.estimateChange) : "--"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View className="p-60rpx text-center text-gray-5">
              <Text>暂无基金数据</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
