/**
 * 财经日历组件
 */

import type { CalendarEvent, ImportanceLevel } from "~/types/calendar";
import { useQuery } from "@tanstack/react-query";
import { Text, View } from "@tarojs/components";
import dayjs from "dayjs";
import { getTodayImportantEvents } from "~/api/calendar";

/**
 * 获取重要程度对应的颜色
 */
function getImportanceColor(importance: ImportanceLevel): string {
  switch (importance) {
    case "high":
      return "text-red-6";
    case "medium":
      return "text-orange-6";
    case "low":
      return "text-gray-6";
    default:
      return "text-gray-6";
  }
}

/**
 * 获取事件类型对应的图标
 */
function getEventIcon(type: CalendarEvent["type"]): string {
  switch (type) {
    case "economic":
      return "📊";
    case "policy":
      return "📋";
    case "earnings":
      return "💰";
    case "holiday":
      return "🏖️";
    default:
      return "📅";
  }
}

/**
 * 财经日历组件属性
 */
interface CalendarWidgetProps {
  /** 最多显示事件数量 */
  maxEvents?: number;
}

export default function CalendarWidget({ maxEvents = 5 }: CalendarWidgetProps) {
  // 获取今日重要事件
  const { data: eventsResponse, isLoading } = useQuery({
    queryKey: ["calendar", "today"],
    queryFn: getTodayImportantEvents,
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 30 * 60 * 1000, // 30分钟
  });

  const events = eventsResponse?.data || [];
  const displayEvents = events.slice(0, maxEvents);

  return (
    <View className="rounded-24rpx bg-white/95 p-40rpx shadow-lg">
      {/* 标题 */}
      <View className="mb-30rpx flex items-center justify-between">
        <View className="flex items-center">
          <Text className="mr-10rpx text-32rpx">📅</Text>
          <Text className="text-32rpx text-gray-8 font-bold">财经日历</Text>
        </View>
        <Text className="text-24rpx text-gray-5">{dayjs().format("MM月DD日")}</Text>
      </View>

      {/* 事件列表 */}
      {isLoading ? (
        <View className="py-40rpx text-center">
          <Text className="text-28rpx text-gray-5">加载中...</Text>
        </View>
      ) : displayEvents.length > 0 ? (
        <View className="space-y-20rpx">
          {displayEvents.map(event => (
            <View key={event.id} className="flex items-start border-b border-gray-2 pb-20rpx last:border-b-0">
              {/* 时间线 */}
              <View className="mr-20rpx flex-shrink-0 text-center" style={{ width: "100rpx" }}>
                <Text className="block text-24rpx text-gray-5">{event.time || "--:--"}</Text>
              </View>

              {/* 事件内容 */}
              <View className="flex-1">
                <View className="mb-8rpx flex items-center">
                  <Text className="mr-8rpx text-28rpx">{getEventIcon(event.type)}</Text>
                  <Text className={`text-28rpx font-medium ${getImportanceColor(event.importance)}`}>
                    {event.title}
                  </Text>
                </View>

                {/* 描述信息 */}
                {event.description && (
                  <Text className="line-clamp-2 block text-24rpx text-gray-6 leading-relaxed">{event.description}</Text>
                )}

                {/* 经济数据指标 */}
                {(event.previous || event.forecast) && (
                  <View className="mt-8rpx flex gap-20rpx text-24rpx">
                    {event.previous && (
                      <Text className="text-gray-5">
                        前值: <Text className="text-gray-7">{event.previous}</Text>
                      </Text>
                    )}
                    {event.forecast && (
                      <Text className="text-gray-5">
                        预期: <Text className="text-gray-7">{event.forecast}</Text>
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="py-40rpx text-center">
          <Text className="block text-28rpx text-gray-5">今日暂无重要事件</Text>
        </View>
      )}

      {/* 查看更多提示 */}
      {events.length > maxEvents && (
        <View className="mt-20rpx border-t border-gray-2 pt-20rpx text-center">
          <Text className="text-24rpx text-blue-6">还有 {events.length - maxEvents} 个事件</Text>
        </View>
      )}
    </View>
  );
}
