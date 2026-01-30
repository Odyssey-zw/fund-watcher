import type { FundSearchResult } from "~/types/fund";
import { ArrowDown, ArrowUp, MoreOutlined } from "@taroify/icons";
import { ScrollView, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useMemo, useState } from "react";
import { getHotFunds } from "~/api/fund";
import {
  formatFundValue,
  formatPercentage,
  getTrendColorClass,
} from "~/utils/fundUtils";
import "./index.scss";

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
  const [topSafeHeight, setTopSafeHeight] = useState(0);
  const [funds, setFunds] = useState<FundSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"unitValue" | "estimate" | "return">(
    "unitValue",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const loadFunds = async (page: number = currentPage) => {
    try {
      setLoading(true);
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
    }
  };

  useEffect(() => {
    loadFunds(1);
    try {
      const windowInfo = Taro.getWindowInfo();
      const height =
        windowInfo.statusBarHeight ?? windowInfo.safeArea?.top ?? 0;
      setTopSafeHeight(Number(height) || 0);
    } catch {
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

  const handlePullDownRefresh = () => {
    setCurrentPage(1);
    loadFunds(1);
  };

  const handleReachBottom = () => {
    if (hasMore && !loading) {
      setCurrentPage(p => p + 1);
    }
  };

  return (
    <View
      className="fund-list-component"
      style={
        topSafeHeight > 0 ? { paddingTop: `${topSafeHeight + 8}px` } : undefined
      }
    >
      <View className="fund-list-header">
        <Text className="fund-list-title">基金列表</Text>
      </View>

      <View className="fund-tabs">
        {TABS.map(tab => (
          <View
            key={tab.key}
            className={`fund-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
        <View className="fund-tabs-more">
          <MoreOutlined />
        </View>
      </View>

      <ScrollView
        className="fund-list-container"
        scrollY
        refresherEnabled
        refresherTriggered={false}
        onRefresherRefresh={handlePullDownRefresh}
        onScrollToLower={handleReachBottom}
      >
        {loading ? (
          <View className="loading">
            <Text>加载中...</Text>
          </View>
        ) : displayedFunds.length > 0 ? (
          <ScrollView className="fund-table-wrapper" scrollX>
            <View className="fund-table-header">
              <View className="fund-th fund-th-name">
                <Text>基金名称</Text>
              </View>
              <View
                className="fund-th fund-th-num"
                onClick={() => handleSort("unitValue")}
              >
                <View>
                  <Text>净值</Text>
                  <Text className="fund-th-date">{formatDateLabel(1)}</Text>
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
                className="fund-th fund-th-num"
                onClick={() => handleSort("estimate")}
              >
                <View>
                  <Text>估值</Text>
                  <Text className="fund-th-date">{formatDateLabel(0)}</Text>
                </View>
                {sortBy === "estimate" ? (
                  sortOrder === "desc" ? (
                    <ArrowDown />
                  ) : (
                    <ArrowUp />
                  )
                ) : null}
              </View>
              <View
                className="fund-th fund-th-return"
                onClick={() => handleSort("return")}
              >
                <View>
                  <Text>添加后收益</Text>
                  <Text className="fund-th-sub">添加时长</Text>
                </View>
                {sortBy === "return" ? (
                  sortOrder === "desc" ? (
                    <ArrowDown />
                  ) : (
                    <ArrowUp />
                  )
                ) : null}
              </View>
              <View className="fund-th fund-th-rate">
                <Text>近1周</Text>
              </View>
              <View className="fund-th fund-th-rate">
                <Text>近1月</Text>
              </View>
              <View className="fund-th fund-th-rate">
                <Text>近6月</Text>
              </View>
            </View>
            <View className="fund-table-body">
              {displayedFunds.map(fund => (
                <View
                  key={fund.code}
                  className="fund-row"
                  onClick={() =>
                    Taro.navigateTo({
                      url: `/pages/fund-detail/index?code=${fund.code}`,
                    })
                  }
                >
                  <View className="fund-row-left">
                    <Text className="fund-row-name">{fund.name}</Text>
                    <Text className="fund-row-code">{fund.code}</Text>
                  </View>
                  <View className="fund-row-right">
                    <View className="fund-col">
                      <Text className="fund-num">
                        {formatFundValue(fund.unitValue ?? 0)}
                      </Text>
                      <Text
                        className={`fund-change ${getTrendColorClass(fund.dayGrowthRate ?? 0)}`}
                      >
                        {fund.dayGrowthRate != null
                          ? formatPercentage(fund.dayGrowthRate)
                          : "--"}
                      </Text>
                    </View>
                    <View className="fund-col">
                      <Text className="fund-num">
                        {fund.estimateValue != null
                          ? formatFundValue(fund.estimateValue)
                          : "--"}
                      </Text>
                      <Text
                        className={`fund-change ${getTrendColorClass(fund.estimateChange ?? 0)}`}
                      >
                        {fund.estimateChange != null
                          ? formatPercentage(fund.estimateChange)
                          : "--"}
                      </Text>
                    </View>
                    <View className="fund-col fund-col-return">
                      <Text
                        className={`fund-num ${getTrendColorClass(fund.returnAfterAddition ?? 0)}`}
                      >
                        {fund.returnAfterAddition != null
                          ? `${fund.returnAfterAddition >= 0 ? "+" : ""}${fund.returnAfterAddition.toFixed(2)}`
                          : "--"}
                      </Text>
                      <Text className="fund-duration">
                        {fund.durationDays != null
                          ? `${fund.durationDays}天`
                          : "--"}
                      </Text>
                    </View>
                    <View className="fund-col fund-col-rate">
                      <Text
                        className={`fund-change ${fund.currentValue?.week1GrowthRate != null ? getTrendColorClass(fund.currentValue.week1GrowthRate) : ""}`}
                      >
                        {fund.currentValue?.week1GrowthRate != null
                          ? formatPercentage(fund.currentValue.week1GrowthRate)
                          : "--"}
                      </Text>
                    </View>
                    <View className="fund-col fund-col-rate">
                      <Text
                        className={`fund-change ${fund.currentValue?.month1GrowthRate != null ? getTrendColorClass(fund.currentValue.month1GrowthRate) : ""}`}
                      >
                        {fund.currentValue?.month1GrowthRate != null
                          ? formatPercentage(fund.currentValue.month1GrowthRate)
                          : "--"}
                      </Text>
                    </View>
                    <View className="fund-col fund-col-rate">
                      <Text
                        className={`fund-change ${fund.currentValue?.month6GrowthRate != null ? getTrendColorClass(fund.currentValue.month6GrowthRate) : ""}`}
                      >
                        {fund.currentValue?.month6GrowthRate != null
                          ? formatPercentage(fund.currentValue.month6GrowthRate)
                          : "--"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <View className="empty-state">
            <Text>暂无基金数据</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
