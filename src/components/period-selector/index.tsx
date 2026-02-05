/**
 * 时间周期选择器组件
 * 用于基金图表的时间周期切换
 */

import type { FundChartPeriod } from "~/types/fund";
import { Text, View } from "@tarojs/components";

interface PeriodSelectorProps {
  /** 当前选中的周期 */
  selectedPeriod: FundChartPeriod;
  /** 周期变化回调 */
  onPeriodChange: (period: FundChartPeriod) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

// 周期配置
const PERIODS: Array<{
  key: FundChartPeriod;
  label: string;
  description: string;
}> = [
  { key: "1d", label: "日", description: "近1日" },
  { key: "5d", label: "周", description: "近5日" },
  { key: "1m", label: "月", description: "近1月" },
  { key: "3m", label: "季", description: "近3月" },
  { key: "6m", label: "半年", description: "近6月" },
  { key: "1y", label: "年", description: "近1年" },
  { key: "all", label: "全部", description: "全部数据" },
];

export default function PeriodSelector({ selectedPeriod, onPeriodChange, disabled = false }: PeriodSelectorProps) {
  const handlePeriodClick = (period: FundChartPeriod) => {
    if (disabled) {
      return;
    }
    onPeriodChange(period);
  };

  return (
    <View className="flex flex-wrap items-center justify-center gap-16rpx p-24rpx">
      {PERIODS.map(period => {
        const isSelected = selectedPeriod === period.key;
        const isDisabled = disabled;

        return (
          <View
            key={period.key}
            className={`
              flex items-center justify-center cursor-pointer select-none rounded-full px-28rpx py-12rpx text-26rpx transition-all duration-200
              ${
                isSelected
                  ? "bg-primary-6 text-white font-500"
                  : isDisabled
                    ? "bg-gray-2 text-gray-4 cursor-not-allowed"
                    : "bg-gray-1 text-gray-7 hover:bg-gray-2 active:bg-gray-3"
              }
            `}
            onClick={() => handlePeriodClick(period.key)}
          >
            <Text>{period.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

/**
 * 获取周期的显示名称
 */
export function getPeriodDisplayName(period: FundChartPeriod): string {
  const periodConfig = PERIODS.find(p => p.key === period);
  return periodConfig?.description || period;
}

/**
 * 获取周期的简短标签
 */
export function getPeriodLabel(period: FundChartPeriod): string {
  const periodConfig = PERIODS.find(p => p.key === period);
  return periodConfig?.label || period;
}
