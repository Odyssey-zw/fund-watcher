/**
 * 基金详情页
 * 展示基金的详细信息、净值走势图表和相关数据
 */

import type { FundChartData, FundChartPeriod, FundDetailPage, FundPerformanceMetrics } from "~/types/fund";
import { ScrollView, Text, View } from "@tarojs/components";
import { useLoad, useRouter } from "@tarojs/taro";
import { useEffect, useState } from "react";
import { getFundChartData, getFundDetail } from "~/api/fund";
import FundChart from "~/components/fund-chart";
import PageWrapper from "~/components/page-wrapper";
import PeriodSelector from "~/components/period-selector";
import { formatFundValue, formatPercentage, getTrendColorStyle } from "~/utils/fundUtils";

const PLACEHOLDER = "--";

/** 无数据时显示占位符 */
function orPlaceholder(value: string | number | undefined | null, format?: (v: string | number) => string): string {
  if (value === undefined || value === null || value === "") {
    return PLACEHOLDER;
  }
  if (typeof value === "number" && Number.isNaN(value)) {
    return PLACEHOLDER;
  }
  return format ? format(value) : String(value);
}

export default function FundDetail() {
  const router = useRouter();
  const fundCode = router.params.code || "";

  const [fundDetail, setFundDetail] = useState<FundDetailPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [initialChartLoading, setInitialChartLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<FundChartPeriod>("all");
  const [error, setError] = useState<string>("");

  useLoad(() => {
    console.log("Fund Detail page loaded, code:", fundCode);
  });

  // 计算性能指标
  const calculatePerformanceMetricsLocal = (
    chartData: FundChartData[],
    _currentDayGrowthRate: number, // 使用 _ 前缀表示未使用的参数
  ): FundPerformanceMetrics => {
    if (chartData.length === 0) {
      return {
        sharpeRatio: 0,
        maxDrawdown: 0,
        volatility: 0,
        annualizedReturn: 0,
      };
    }

    const returns = chartData.slice(1).map((point, index) => {
      const prevValue = chartData[index].value;
      return (point.value - prevValue) / prevValue;
    });

    // 计算年化收益率
    const totalReturn = (chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value;
    const daysCount = chartData.length - 1;
    const annualizedReturn = (1 + totalReturn) ** (365 / daysCount) - 1;

    // 计算波动率
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + (r - avgReturn) ** 2, 0) / returns.length;
    const volatility = Math.sqrt(variance * 365); // 年化波动率

    // 计算最大回撤
    let maxDrawdown = 0;
    let peak = chartData[0].value;

    for (const point of chartData) {
      if (point.value > peak) {
        peak = point.value;
      } else {
        const drawdown = (peak - point.value) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }

    // 计算夏普比率（假设无风险利率为3%）
    const riskFreeRate = 0.03;
    const sharpeRatio = volatility > 0 ? (annualizedReturn - riskFreeRate) / volatility : 0;

    return {
      sharpeRatio: Number(sharpeRatio.toFixed(2)),
      maxDrawdown: Number(maxDrawdown.toFixed(4)),
      volatility: Number(volatility.toFixed(4)),
      annualizedReturn: Number(annualizedReturn.toFixed(4)),
    };
  };

  // 异步加载完整图表数据（用函数式 setState 避免闭包里的 fundDetail 过时）
  const loadFullChartData = async (code: string, period: FundChartPeriod) => {
    setInitialChartLoading(true);
    try {
      let response = await getFundChartData(code, period);
      // 首次可能因 302 等拿到空数据，重试一次
      if (response.success && response.data.length === 0) {
        await new Promise(r => setTimeout(r, 300));
        response = await getFundChartData(code, period);
      }
      if (response.success && response.data.length > 0) {
        setFundDetail(prev => {
          if (!prev) {
            return prev;
          }
          return {
            ...prev,
            chartData: response.data,
            performanceMetrics: calculatePerformanceMetricsLocal(response.data, prev.currentValue.dayGrowthRate),
          };
        });
      }
    } catch (err) {
      console.error("加载完整图表数据失败:", err);
    } finally {
      setInitialChartLoading(false);
    }
  };

  // 加载基金详情数据
  const loadFundDetail = async () => {
    if (!fundCode) {
      setError("基金代码不能为空");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getFundDetail(fundCode);

      if (response.success) {
        setFundDetail(response.data);
        setError("");

        // 加载完整图表数据（默认全部）
        setTimeout(() => {
          loadFullChartData(fundCode, "all");
        }, 0);
      } else {
        setError(response.message || "获取基金详情失败");
      }
    } catch (err) {
      console.error("加载基金详情失败:", err);
      setError("网络异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 切换图表周期
  const handlePeriodChange = async (period: FundChartPeriod) => {
    if (!fundCode || period === selectedPeriod) {
      return;
    }

    try {
      setChartLoading(true);
      setSelectedPeriod(period);

      const response = await getFundChartData(fundCode, period);
      if (response.success) {
        setFundDetail(prev => (prev ? { ...prev, chartData: response.data } : prev));
      }
    } catch (err) {
      console.error("加载图表数据失败:", err);
    } finally {
      setChartLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    loadFundDetail();
  }, [fundCode]);

  // 错误状态
  if (error) {
    return (
      <PageWrapper title="基金详情" showHeader headerStyle="default" contentPadding={false}>
        <View className="h-screen flex items-center justify-center">
          <View className="text-center">
            <Text className="mb-20rpx block text-32rpx text-red-5">{error}</Text>
            <View
              className="cursor-pointer rounded-8rpx bg-primary-6 px-32rpx py-16rpx text-white"
              onClick={loadFundDetail}
            >
              <Text>重新加载</Text>
            </View>
          </View>
        </View>
      </PageWrapper>
    );
  }

  // 加载状态
  if (loading || !fundDetail) {
    return (
      <PageWrapper title="基金详情" showHeader headerStyle="default" contentPadding={false}>
        <View className="h-screen flex items-center justify-center">
          <Text className="text-32rpx text-gray-5">基金详情加载中...</Text>
        </View>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={fundDetail.name} showHeader headerStyle="default" contentPadding={false} enableScroll={false}>
      <ScrollView className="h-full" scrollY enhanced showScrollbar={false}>
        {/* 基金基本信息 */}
        <FundBasicInfo fundDetail={fundDetail} />

        {/* 图表区域 */}
        <FundChartSection
          fundDetail={fundDetail}
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          chartLoading={chartLoading}
          initialChartLoading={initialChartLoading}
          onChartRetry={() => loadFullChartData(fundCode, selectedPeriod)}
        />

        {/* 详细数据 */}
        <FundDetailInfo fundDetail={fundDetail} />

        {/* 底部空白，避免被tab栏遮挡 */}
        <View className="h-120rpx"></View>
      </ScrollView>
    </PageWrapper>
  );
}

/**
 * 基金基本信息组件
 */
function FundBasicInfo({ fundDetail }: { fundDetail: FundDetailPage }) {
  return (
    <View className="bg-white p-32rpx">
      <View className="mb-24rpx">
        <Text className="text-28rpx text-gray-5">
          {orPlaceholder(fundDetail.code)} | {orPlaceholder(fundDetail.company)}
        </Text>
      </View>

      <View className="mb-24rpx flex items-end justify-between">
        <View>
          <View className="mb-8rpx flex items-baseline">
            <Text className="mr-16rpx text-48rpx text-gray-8 font-600">
              {orPlaceholder(fundDetail.currentValue?.unitValue, v => formatFundValue(v as number))}
            </Text>
            <Text className="text-24rpx text-gray-5">{orPlaceholder(fundDetail.currentValue?.date)}</Text>
          </View>
          <View className="flex items-center">
            <Text
              className="mr-16rpx text-28rpx font-500"
              style={getTrendColorStyle(fundDetail.currentValue?.dayGrowthRate ?? 0)}
            >
              {fundDetail.currentValue?.dayGrowthRate != null && !Number.isNaN(fundDetail.currentValue.dayGrowthRate)
                ? `${fundDetail.currentValue.dayGrowthRate > 0 ? "+" : ""}${formatPercentage(fundDetail.currentValue.dayGrowthRate)}`
                : PLACEHOLDER}
            </Text>
            <Text className="text-24rpx" style={getTrendColorStyle(fundDetail.currentValue?.dayGrowthRate ?? 0)}>
              {fundDetail.currentValue?.dayGrowthAmount != null &&
              !Number.isNaN(fundDetail.currentValue.dayGrowthAmount)
                ? `${fundDetail.currentValue.dayGrowthAmount > 0 ? "+" : ""}${fundDetail.currentValue.dayGrowthAmount.toFixed(4)}`
                : PLACEHOLDER}
            </Text>
          </View>
        </View>

        {/* 风险等级 */}
        <View className="flex flex-col items-end">
          <Text className="mb-8rpx text-24rpx text-gray-5">风险等级</Text>
          <View className="flex">
            {Array.from({ length: 5 }).map((_, index) => (
              <View
                key={index}
                className={`w-16rpx h-16rpx rounded-2rpx mr-4rpx ${
                  index < fundDetail.riskLevel ? "bg-orange" : "bg-gray-3"
                }`}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * 图表区域组件
 */
function FundChartSection({
  fundDetail,
  selectedPeriod,
  onPeriodChange,
  chartLoading,
  initialChartLoading,
  onChartRetry,
}: {
  fundDetail: FundDetailPage;
  selectedPeriod: FundChartPeriod;
  onPeriodChange: (period: FundChartPeriod) => void;
  chartLoading: boolean;
  initialChartLoading: boolean;
  onChartRetry: () => void;
}) {
  const chartEmpty = fundDetail.chartData.length === 0;
  const showChartLoading = chartLoading || (chartEmpty && initialChartLoading);
  const showEmptyWithRetry = chartEmpty && !showChartLoading;

  return (
    <View className="mt-16rpx bg-white">
      <PeriodSelector
        selectedPeriod={selectedPeriod}
        onPeriodChange={onPeriodChange}
        disabled={chartLoading || initialChartLoading}
      />

      <View className="px-24rpx pb-32rpx">
        {showEmptyWithRetry ? (
          <View className="h-400rpx flex flex-col items-center justify-center">
            <Text className="text-28rpx text-gray-5">暂无图表数据</Text>
            <Text className="mt-16rpx text-24rpx text-gray-4">手机预览需配置请求域名或网络不稳定时可重试</Text>
            <View className="mt-24rpx rounded-8rpx bg-primary-6 px-32rpx py-16rpx" onClick={onChartRetry}>
              <Text className="text-28rpx text-white">点击重试</Text>
            </View>
          </View>
        ) : (
          <FundChart data={fundDetail.chartData} height={400} period={selectedPeriod} loading={showChartLoading} />
        )}
      </View>
    </View>
  );
}

/**
 * 详细信息组件
 */
function FundDetailInfo({ fundDetail }: { fundDetail: FundDetailPage }) {
  const { performanceMetrics } = fundDetail;

  return (
    <View className="mt-16rpx bg-white p-32rpx">
      <Text className="mb-32rpx block text-32rpx text-gray-8 font-600">基金详情</Text>

      {/* 基本信息 */}
      <View className="mb-40rpx">
        <View className="flex items-center justify-between border-b border-gray-2 py-24rpx">
          <Text className="text-28rpx text-gray-6">基金经理</Text>
          <Text className="text-28rpx text-gray-8">{orPlaceholder(fundDetail.manager)}</Text>
        </View>
        <View className="flex items-center justify-between border-b border-gray-2 py-24rpx">
          <Text className="text-28rpx text-gray-6">基金规模</Text>
          <Text className="text-28rpx text-gray-8">{orPlaceholder(fundDetail.scale)}</Text>
        </View>
        <View className="flex items-center justify-between border-b border-gray-2 py-24rpx">
          <Text className="text-28rpx text-gray-6">成立日期</Text>
          <Text className="text-28rpx text-gray-8">{orPlaceholder(fundDetail.establishDate)}</Text>
        </View>
        <View className="flex items-center justify-between py-24rpx">
          <Text className="text-28rpx text-gray-6">基金类型</Text>
          <Text className="text-28rpx text-gray-8">
            {fundDetail.type ? getFundTypeName(fundDetail.type) : PLACEHOLDER}
          </Text>
        </View>
      </View>

      {/* 性能指标 */}
      {performanceMetrics && (
        <View>
          <Text className="mb-24rpx block text-28rpx text-gray-8 font-600">性能指标</Text>
          <View className="grid grid-cols-2 gap-32rpx">
            <View className="text-center">
              <Text className="mb-8rpx block text-32rpx text-gray-8 font-600">
                {performanceMetrics.annualizedReturn != null && performanceMetrics.annualizedReturn !== 0
                  ? `${(performanceMetrics.annualizedReturn * 100).toFixed(2)}%`
                  : PLACEHOLDER}
              </Text>
              <Text className="text-24rpx text-gray-5">年化收益率</Text>
            </View>
            <View className="text-center">
              <Text className="mb-8rpx block text-32rpx text-gray-8 font-600">
                {performanceMetrics.sharpeRatio != null && performanceMetrics.sharpeRatio !== 0
                  ? performanceMetrics.sharpeRatio.toFixed(2)
                  : PLACEHOLDER}
              </Text>
              <Text className="text-24rpx text-gray-5">夏普比率</Text>
            </View>
            <View className="text-center">
              <Text className="mb-8rpx block text-32rpx text-gray-8 font-600">
                {performanceMetrics.maxDrawdown != null && performanceMetrics.maxDrawdown !== 0
                  ? `${(performanceMetrics.maxDrawdown * 100).toFixed(2)}%`
                  : PLACEHOLDER}
              </Text>
              <Text className="text-24rpx text-gray-5">最大回撤</Text>
            </View>
            <View className="text-center">
              <Text className="mb-8rpx block text-32rpx text-gray-8 font-600">
                {performanceMetrics.volatility != null && performanceMetrics.volatility !== 0
                  ? `${(performanceMetrics.volatility * 100).toFixed(2)}%`
                  : PLACEHOLDER}
              </Text>
              <Text className="text-24rpx text-gray-5">波动率</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

/**
 * 获取基金类型名称
 */
function getFundTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    gp: "股票型",
    zq: "债券型",
    hh: "混合型",
    zs: "指数型",
  };
  return typeMap[type] || "其他";
}
