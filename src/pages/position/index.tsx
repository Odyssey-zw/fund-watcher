import { ArrowDown, ArrowUp, Plus } from "@taroify/icons";
import { Button, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import { deletePosition } from "~/api/position";
import AppTabbar from "~/components/AppTabbar";
import PageWrapper from "~/components/page-wrapper";
import { usePositionStore } from "~/store";
import { useAppStore } from "~/store/useAppStore";
import { formatAmount, formatFundValue, formatPercentage, getTrendColorStyle } from "~/utils/fundUtils";

export default function PositionPage() {
  const { positions, summary, loading, loadAllData } = usePositionStore();
  const [sortBy, setSortBy] = useState<"profit" | "profitRate" | "marketValue">("profit");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const setActiveTabKey = useAppStore(state => state.setActiveTabKey);

  useEffect(() => {
    setActiveTabKey("position");
  }, [setActiveTabKey]);

  const loadData = async () => {
    try {
      await loadAllData();
    } catch (error) {
      console.error("加载持仓数据失败:", error);
      Taro.showToast({
        title: "加载失败",
        icon: "none",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const sortedPositions = [...positions].sort((a, b) => {
    let aVal = 0;
    let bVal = 0;

    switch (sortBy) {
      case "profit":
        aVal = a.profit || 0;
        bVal = b.profit || 0;
        break;
      case "profitRate":
        aVal = a.profitRate || 0;
        bVal = b.profitRate || 0;
        break;
      case "marketValue":
        aVal = a.marketValue || 0;
        bVal = b.marketValue || 0;
        break;
    }

    return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
  });

  const handleAddPosition = () => {
    Taro.navigateTo({
      url: "/pages/add-position/index",
    });
  };

  const handleEditPosition = (fundCode: string) => {
    Taro.navigateTo({
      url: `/pages/add-position/index?fundCode=${fundCode}&mode=edit`,
    });
  };

  const handleViewDetail = (fundCode: string) => {
    Taro.navigateTo({
      url: `/pages/fund-detail/index?code=${fundCode}`,
    });
  };

  const handleDeletePosition = async (fundCode: string, fundName: string) => {
    try {
      const result = await Taro.showModal({
        title: "确认删除",
        content: `确定要删除基金"${fundName}"的持仓记录吗?`,
        confirmText: "删除",
        cancelText: "取消",
      });

      if (result.confirm) {
        const response = await deletePosition(fundCode);
        if (response.success) {
          usePositionStore.getState().removePosition(fundCode);
          await loadData();

          Taro.showToast({
            title: "删除成功",
            icon: "success",
          });
        } else {
          Taro.showToast({
            title: "删除失败",
            icon: "none",
          });
        }
      }
    } catch (error) {
      console.error("删除持仓失败:", error);
      Taro.showToast({
        title: "删除失败",
        icon: "none",
      });
    }
  };

  if (loading) {
    return (
      <View className="index-page" style={{ height: "100vh", overflow: "hidden" }}>
        <View className="index-page__content" style={{ height: "100%", overflow: "auto" }}>
          <PageWrapper title="我的持仓" showHeader headerStyle="centered" contentPadding={true} enableScroll={false}>
            <View className="pt-120rpx text-center text-32rpx text-gray-5">
              <Text>加载中...</Text>
            </View>
          </PageWrapper>
        </View>
        <AppTabbar />
      </View>
    );
  }

  return (
    <View className="index-page" style={{ height: "100vh", overflow: "hidden" }}>
      <View className="index-page__content" style={{ height: "100%", overflow: "auto" }}>
        <PageWrapper title="我的持仓" showHeader headerStyle="centered" contentPadding={false} enableScroll={true}>
          <View className="from-blue-400 to-blue-600 bg-gradient-to-r p-30rpx text-white">
            <View className="mb-20rpx">
              <Text className="text-28rpx opacity-90">总资产</Text>
            </View>
            <View className="mb-30rpx">
              <Text className="text-48rpx font-600">¥{formatAmount(summary.totalAssets)}</Text>
            </View>
            <View className="flex items-center justify-between">
              <View>
                <Text className="mb-8rpx block text-24rpx opacity-90">总收益</Text>
                <Text className="text-32rpx font-500" style={getTrendColorStyle(summary.totalProfit)}>
                  {summary.totalProfit >= 0 ? "+" : ""}¥{formatAmount(summary.totalProfit)}
                </Text>
              </View>
              <View className="text-right">
                <Text className="mb-8rpx block text-24rpx opacity-90">收益率</Text>
                <Text className="text-32rpx font-500" style={getTrendColorStyle(summary.totalProfitRate)}>
                  {formatPercentage(summary.totalProfitRate)}
                </Text>
              </View>
            </View>
          </View>

          {positions.length === 0 ? (
            <View className="p-60rpx text-center">
              <View className="mb-40rpx text-120rpx text-gray-3">📈</View>
              <Text className="mb-40rpx block text-32rpx text-gray-5">暂无持仓记录</Text>
              <Button className="rounded-full bg-primary-6 px-60rpx py-20rpx text-white" onClick={handleAddPosition}>
                <Plus className="mr-10rpx" />
                添加持仓
              </Button>
            </View>
          ) : (
            <>
              <View className="flex items-center justify-between border-b border-gray-200 bg-white p-30rpx">
                <Text className="text-28rpx text-gray-6">
                  共{summary.positionCount}
                  只基金
                </Text>
                <Button
                  size="mini"
                  className="rounded-full bg-primary-6 px-20rpx py-10rpx text-24rpx text-white"
                  onClick={handleAddPosition}
                >
                  <Plus className="mr-8rpx" />
                  添加
                </Button>
              </View>

              <View className="flex items-center border-b border-gray-200 bg-gray-50 px-30rpx py-20rpx">
                <View className="w-200rpx text-24rpx text-gray-5">基金名称</View>
                <View
                  className="flex flex-1 cursor-pointer items-center justify-center"
                  onClick={() => handleSort("marketValue")}
                >
                  <Text className="mr-8rpx text-24rpx text-gray-5">持仓市值</Text>
                  {sortBy === "marketValue" && (sortOrder === "desc" ? <ArrowDown size={16} /> : <ArrowUp size={16} />)}
                </View>
                <View
                  className="flex flex-1 cursor-pointer items-center justify-center"
                  onClick={() => handleSort("profit")}
                >
                  <Text className="mr-8rpx text-24rpx text-gray-5">浮动盈亏</Text>
                  {sortBy === "profit" && (sortOrder === "desc" ? <ArrowDown size={16} /> : <ArrowUp size={16} />)}
                </View>
                <View
                  className="flex flex-1 cursor-pointer items-center justify-center"
                  onClick={() => handleSort("profitRate")}
                >
                  <Text className="mr-8rpx text-24rpx text-gray-5">收益率</Text>
                  {sortBy === "profitRate" && (sortOrder === "desc" ? <ArrowDown size={16} /> : <ArrowUp size={16} />)}
                </View>
              </View>

              <View>
                {sortedPositions.map(position => (
                  <View key={position.fundCode} className="border-b border-gray-200 bg-white px-30rpx py-24rpx">
                    <View className="flex cursor-pointer items-center" onClick={() => handleViewDetail(position.fundCode)}>
                      <View className="w-200rpx pr-20rpx">
                        <Text className="mb-8rpx block overflow-hidden text-ellipsis whitespace-nowrap text-28rpx text-gray-8 font-500">
                          {position.fundName}
                        </Text>
                        <Text className="mb-8rpx block text-24rpx text-gray-5">{position.fundCode}</Text>
                        <Text className="text-22rpx text-gray-4">
                          持有
                          {formatAmount(position.shares)}份
                        </Text>
                      </View>

                      <View className="flex-1 text-center">
                        <Text className="mb-8rpx block text-28rpx text-gray-8 font-500">
                          ¥{formatAmount(position.marketValue || 0)}
                        </Text>
                        <Text className="text-24rpx text-gray-5">
                          净值
                          {formatFundValue(position.currentValue || 0)}
                        </Text>
                      </View>

                      <View className="flex-1 text-center">
                        <Text
                          className="mb-8rpx block text-28rpx font-500"
                          style={getTrendColorStyle(position.profit || 0)}
                        >
                          {(position.profit || 0) >= 0 ? "+" : ""}¥{formatAmount(position.profit || 0)}
                        </Text>
                      </View>

                      <View className="flex-1 text-center">
                        <Text className="text-28rpx font-500" style={getTrendColorStyle(position.profitRate || 0)}>
                          {formatPercentage(position.profitRate || 0)}
                        </Text>
                      </View>
                    </View>

                    <View className="mt-20rpx flex justify-end border-t border-gray-100 pt-20rpx">
                      <Button
                        size="mini"
                        className="mr-16rpx rounded bg-gray-100 px-24rpx py-8rpx text-24rpx text-gray-6"
                        onClick={e => {
                          e.stopPropagation();
                          handleEditPosition(position.fundCode);
                        }}
                      >
                        编辑
                      </Button>
                      <Button
                        size="mini"
                        className="rounded bg-red-100 px-24rpx py-8rpx text-24rpx text-red-600"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeletePosition(position.fundCode, position.fundName);
                        }}
                      >
                        删除
                      </Button>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </PageWrapper>
      </View>
      <AppTabbar />
    </View>
  );
}
