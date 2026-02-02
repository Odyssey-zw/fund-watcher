import type { FundSearchResult } from "~/types/fund";
import { ArrowDown, ArrowUp, MoreOutlined } from "@taroify/icons";
import { ScrollView, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useMemo, useState } from "react";
import { getHotFunds } from "~/api/fund";
import PageWrapper from "~/components/page-wrapper";
import {
  formatFundValue,
  formatPercentage,
  getTrendColorClass,
} from "~/utils/fundUtils";

/** 顶部 Tab 选项 */
const TABS = [
  { key: "all", label: "全部" },
  { key: "held", label: "持有" },
  { key: "cleared", label: "已清仓" },
  { key: "gp", label: "偏股" },
  { key: "zq", label: "偏债" },
  { key: "zs", label: "指数" },
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
  const [sortBy, setSortBy] = useState<"unitValue" | "estimate" | "return">(
    "unitValue",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [topSafeHeight, setTopSafeHeight] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadFunds = async (page: number = currentPage, isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      const response = await getHotFunds({ page, pageSize: 20 });
      if (response.success) {
        if (page === 1) {
          setFunds((response.data.list as FundSearchResult[]) || []);
        } else {
          setFunds(prev => [
            ...prev,
            ...((response.data.list as FundSearchResult[]) || []),
          ]);
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
      setLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    loadFunds(1);
  }, []);

  useEffect(() => {
    try {
      const windowInfo = Taro.getWindowInfo();
      // statusBarHeight 是 px 单位，需要转换为 rpx
      // 1px = 2rpx (假设设计稿是 750rpx = 375px)
      // 优先使用 statusBarHeight，如果没有则使用 safeArea.top
      const statusBarHeight =
        windowInfo.statusBarHeight ?? windowInfo.safeArea?.top ?? 0;
      const height = statusBarHeight * 2;
      setTopSafeHeight(Math.max(Number(height) || 0, 0));
    } catch (error) {
      console.warn("Failed to get safe area height:", error);
      setTopSafeHeight(0);
    }
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

  const handlePullDownRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await loadFunds(1, true);
  };

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
      contentPadding={false}
    >
      <View
        className="p-0"
        style={{
          paddingTop: `${topSafeHeight + 176}rpx`, // 安全区域 + 标题(88) + 标签栏(88)
        }}
      >
        <View
          className="pf left-0 right-0 z-99 flex flex-nowrap items-center overflow-x-auto border-b border-gray-200 bg-white py-24rpx pl-24rpx"
          style={{
            top: `${topSafeHeight + 88}rpx`, // 安全区域 + 标题高度
            paddingLeft: "calc(24rpx + env(safe-area-inset-left, 0px))",
            paddingRight: "calc(24rpx + env(safe-area-inset-right, 0px))",
          }}
        >
          {TABS.map(tab => (
            <View
              key={tab.key}
              className={`flex-shrink-0 py-12rpx px-28rpx mr-16rpx text-28rpx pr cursor-pointer transition-colors duration-200 ${
                activeTab === tab.key
                  ? "text-primary-6 font-500 relative after:content-[''] after:absolute after:left-1/2 after:bottom-[-24rpx] after:transform after:-translate-x-1/2 after:w-40rpx after:h-4rpx after:bg-primary-6 after:rounded-2rpx"
                  : "text-gray-6"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text>{tab.label}</Text>
            </View>
          ))}
          <View className="ml-auto flex-shrink-0 px-24rpx py-12rpx text-36rpx text-gray-6">
            <MoreOutlined />
          </View>
        </View>

        <ScrollView
          className="fund-list-container"
          scrollY
          refresherEnabled
          refresherTriggered={refreshing}
          onRefresherRefresh={handlePullDownRefresh}
          onScrollToLower={handleReachBottom}
        >
          {loading ? (
            <View className="p-40rpx text-center text-gray-5">
              <Text>加载中...</Text>
            </View>
          ) : displayedFunds.length > 0 ? (
            <ScrollView className="w-full" scrollX>
              <View className="min-w-600rpx flex items-end border-b border-gray-200 bg-gray-100 px-24rpx py-20rpx pb-16rpx text-24rpx text-gray-5">
                <View className="mr-20rpx max-w-1/2 min-w-0 w-1/2 flex flex-shrink-0 flex-shrink-0 flex-grow-0 items-center gap-8rpx">
                  <View>
                    <Text>基金名称</Text>
                    <Text className="opacity-0"></Text>
                  </View>
                </View>
                <View
                  className="mr-20rpx w-120rpx flex flex-shrink-0 cursor-pointer items-center justify-end gap-8rpx"
                  onClick={() => handleSort("unitValue")}
                >
                  <View>
                    <Text>净值</Text>
                    <Text className="text-20rpx text-gray-4 leading-tight">
                      {formatDateLabel(1)}
                    </Text>
                  </View>
                  {sortBy === "unitValue" ? (
                    sortOrder === "desc" ? (
                      <ArrowDown />
                    ) : (
                      <ArrowUp />
                    )
                  ) : null}
                </View>
                <View
                  className="mr-20rpx w-120rpx flex flex-shrink-0 cursor-pointer items-center justify-end gap-8rpx"
                  onClick={() => handleSort("estimate")}
                >
                  <View>
                    <Text>估值</Text>
                    <Text className="text-20rpx text-gray-4 leading-tight">
                      {formatDateLabel(0)}
                    </Text>
                  </View>
                  {sortBy === "estimate" ? (
                    sortOrder === "desc" ? (
                      <ArrowDown />
                    ) : (
                      <ArrowUp />
                    )
                  ) : null}
                </View>
              </View>
              <View>
                {displayedFunds.map(fund => (
                  <View
                    key={fund.code}
                    className="min-w-600rpx flex cursor-pointer items-center border-b border-gray-200 bg-white px-24rpx py-24rpx transition-colors duration-200 active:bg-gray-50"
                    onClick={() =>
                      Taro.navigateTo({
                        url: `/pages/fund-detail/index?code=${fund.code}`,
                      })
                    }
                  >
                    <View className="mr-20rpx max-w-1/2 min-w-0 w-1/2 flex flex-shrink-0 flex-grow-0 flex-col items-start justify-center overflow-hidden">
                      <Text className="mb-8rpx w-full overflow-hidden text-ellipsis whitespace-nowrap text-28rpx text-gray-8 font-500 leading-tight">
                        {fund.name}
                      </Text>
                      <Text className="text-24rpx text-gray-5 leading-tight">
                        {fund.code}
                      </Text>
                    </View>
                    <View className="min-w-0 flex flex-1 items-center">
                      <View className="mr-20rpx w-120rpx flex flex-shrink-0 flex-col items-end justify-center">
                        <Text className="mb-4rpx text-28rpx font-500 leading-tight">
                          {formatFundValue(fund.unitValue ?? 0)}
                        </Text>
                        <Text
                          className={`text-24rpx leading-tight ${getTrendColorClass(fund.dayGrowthRate ?? 0)}`}
                        >
                          {fund.dayGrowthRate != null
                            ? formatPercentage(fund.dayGrowthRate)
                            : "--"}
                        </Text>
                      </View>
                      <View className="mr-20rpx w-120rpx flex flex-shrink-0 flex-col items-end justify-center">
                        <Text className="mb-4rpx text-28rpx font-500 leading-tight">
                          {fund.estimateValue != null
                            ? formatFundValue(fund.estimateValue)
                            : "--"}
                        </Text>
                        <Text
                          className={`text-24rpx leading-tight ${getTrendColorClass(fund.estimateChange ?? 0)}`}
                        >
                          {fund.estimateChange != null
                            ? formatPercentage(fund.estimateChange)
                            : "--"}
                        </Text>
                      </View>
                      <View className="mr-20rpx w-120rpx flex flex-shrink-0 flex-col items-end justify-center">
                        <Text
                          className={`fund-num ${getTrendColorClass(fund.returnAfterAddition ?? 0)}`}
                        >
                          {fund.returnAfterAddition != null
                            ? `${fund.returnAfterAddition >= 0 ? "+" : ""}${fund.returnAfterAddition.toFixed(2)}`
                            : "--"}
                        </Text>
                        <Text className="text-24rpx text-gray-5 leading-tight">
                          {fund.durationDays != null
                            ? `${fund.durationDays}天`
                            : "--"}
                        </Text>
                      </View>
                      <View className="mr-20rpx w-85rpx flex flex-shrink-0 flex-col items-end justify-center">
                        <Text
                          className={`text-24rpx leading-tight ${fund.currentValue?.week1GrowthRate != null ? getTrendColorClass(fund.currentValue.week1GrowthRate) : ""}`}
                        >
                          {fund.currentValue?.week1GrowthRate != null
                            ? formatPercentage(
                                fund.currentValue.week1GrowthRate,
                              )
                            : "--"}
                        </Text>
                      </View>
                      <View className="mr-20rpx w-85rpx flex flex-shrink-0 flex-col items-end justify-center">
                        <Text
                          className={`text-24rpx leading-tight ${fund.currentValue?.month1GrowthRate != null ? getTrendColorClass(fund.currentValue.month1GrowthRate) : ""}`}
                        >
                          {fund.currentValue?.month1GrowthRate != null
                            ? formatPercentage(
                                fund.currentValue.month1GrowthRate,
                              )
                            : "--"}
                        </Text>
                      </View>
                      <View className="mr-20rpx w-85rpx flex flex-shrink-0 flex-col items-end justify-center">
                        <Text
                          className={`text-24rpx leading-tight ${fund.currentValue?.month6GrowthRate != null ? getTrendColorClass(fund.currentValue.month6GrowthRate) : ""}`}
                        >
                          {fund.currentValue?.month6GrowthRate != null
                            ? formatPercentage(
                                fund.currentValue.month6GrowthRate,
                              )
                            : "--"}
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
    </PageWrapper>
  );
}
