/**
 * 财经日历组件 - 使用 NutUI CalendarCard
 */

import type { CalendarCardDay, CalendarCardMonth } from "@nutui/nutui-react-taro";
import type { CalendarEvent, ImportanceLevel } from "~/types/calendar";
import { CalendarCard } from "@nutui/nutui-react-taro";
import { useQuery } from "@tanstack/react-query";
import { Text, View } from "@tarojs/components";
import dayjs from "dayjs";
import { useMemo, useRef, useState } from "react";
import { getCalendarEvents } from "~/api/calendar";

/**
 * 获取重要程度对应的标记
 */
function getImportanceTag(importance: ImportanceLevel): string {
  switch (importance) {
    case "high":
      return "🔴";
    case "medium":
      return "🟠";
    case "low":
      return "🔵";
    default:
      return "⚪";
  }
}

/**
 * 国内部分固定日期法定节假日（公历）
 * 春节、清明、端午、中秋等农历或滚动假期这里不处理，只做简单高亮
 */
const CHINA_FIXED_HOLIDAYS = [
  { month: 1, day: 1 }, // 元旦
  { month: 5, day: 1 }, // 劳动节
  { month: 10, day: 1 }, // 国庆节
  { month: 10, day: 2 },
  { month: 10, day: 3 },
];

/**
 * 财经日历组件属性
 */
interface CalendarWidgetProps {
  /** 是否显示事件详情 */
  showDetails?: boolean;
}

export default function CalendarWidget({ showDetails = true }: CalendarWidgetProps) {
  const today = useMemo(() => dayjs(), []);

  const [selectedDate, setSelectedDate] = useState<Date>(today.toDate());
  const [currentMonth, setCurrentMonth] = useState(today.month());
  const calendarRef = useRef<any>(null);

  // 获取当月所有事件
  const { data: eventsResponse, isLoading } = useQuery({
    queryKey: ["calendar", `${currentMonth}-${today.year()}`],
    queryFn: () => {
      const start = dayjs(`${today.year()}-${String(currentMonth).padStart(2, "0")}-01`).format("YYYY-MM-DD");
      const end = dayjs(`${today.year()}-${String(currentMonth + 1).padStart(2, "0")}-01`).format("YYYY-MM-DD");
      return getCalendarEvents(start, end);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const events = eventsResponse?.data || [];

  // 按日期分组事件
  const eventsByDate = events.reduce(
    (acc, event) => {
      if (!acc[event.date]) {
        acc[event.date] = [];
      }
      acc[event.date].push(event);
      return acc;
    },
    {} as Record<string, CalendarEvent[]>,
  );

  // 选中日期的事件
  const selectedDateStr = dayjs(selectedDate).format("YYYY-MM-DD");
  const selectedEvents = eventsByDate[selectedDateStr] || [];

  // 根据日数据构造完整日期字符串
  const getDayFullDate = (day: CalendarCardDay) => {
    const year = day.year ?? today.year();
    const month = day.month ?? today.month() + 1;
    const dayNum = day.date;
    return dayjs(`${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`).format("YYYY-MM-DD");
  };

  // 处理日期选择
  const handleDayClick = (day: CalendarCardDay) => {
    const fullDate = getDayFullDate(day);
    const newDate = dayjs(fullDate).toDate();
    setSelectedDate(newDate);
  };

  // 处理页面改变（左右切换月份）
  const handlePageChange = (val: CalendarCardMonth) => {
    setCurrentMonth(val.month);
    // 同步选中日期到当前面板月份，避免因受控 value 导致面板“回弹”到原月份
    const newMonthDate = dayjs(`${val.year}-${String(val.month).padStart(2, "0")}-01`).toDate();
    setSelectedDate(newMonthDate);
  };

  // 回到今天
  const handleBackToToday = () => {
    const now = dayjs();
    setSelectedDate(now.toDate());
    setCurrentMonth(now.month());
    // 同步日历面板显示的月份
    calendarRef.current?.jumpTo(now.year(), now.month() + 1);
  };

  // 自定义日期渲染 - 显示日期数字 + 事件标记
  const renderDay = (day: CalendarCardDay) => {
    const dateStr = getDayFullDate(day);
    const dayEvents = eventsByDate[dateStr] || [];
    const dayNumber = day.date;
    const weekday = dayjs(dateStr).day(); // 0-周日, 6-周六
    const isWeekend = weekday === 0 || weekday === 6;
    const isHoliday = CHINA_FIXED_HOLIDAYS.some(h => h.month === day.month && h.day === day.date);
    const isSelected = dateStr === selectedDateStr;

    let highestImportance: ImportanceLevel | null = null;
    if (dayEvents.length > 0) {
      highestImportance = dayEvents.reduce((max, event) => {
        const importanceWeight = { high: 3, medium: 2, low: 1 };
        const maxWeight = importanceWeight[max];
        const eventWeight = importanceWeight[event.importance];
        return eventWeight > maxWeight ? event.importance : max;
      }, "low" as ImportanceLevel);
    }

    const baseTextColor = isSelected ? "text-white" : isWeekend || isHoliday ? "text-red-5" : "text-gray-8";

    return (
      <View className="h-full w-full flex flex-col items-center justify-center">
        {/* 日期数字：统一高度 */}
        <Text className={`text-26rpx ${baseTextColor}`}>{dayNumber}</Text>

        {/* 事件标记：始终预留一行高度，仅在有事件时显示图标 */}
        <View className="mt-4rpx h-22rpx flex items-center justify-center">
          {highestImportance && <Text className="text-18rpx">{getImportanceTag(highestImportance)}</Text>}
        </View>
      </View>
    );
  };

  return (
    <View className="rounded-24rpx bg-white/95 p-40rpx shadow-lg">
      {/* 标题 + 回到今天 */}
      <View className="mb-30rpx flex items-center justify-between">
        <View className="flex items-center">
          <Text className="mr-10rpx text-32rpx">📅</Text>
          <Text className="text-32rpx text-gray-8 font-bold">投资日历</Text>
        </View>
        <Text className="rounded-full bg-blue-1 px-20rpx py-8rpx text-22rpx text-blue-6" onClick={handleBackToToday}>
          回到今天
        </Text>
      </View>

      {/* 日历组件 */}
      {isLoading ? (
        <View className="py-60rpx text-center">
          <Text className="text-28rpx text-gray-5">加载中...</Text>
        </View>
      ) : (
        <>
          <CalendarCard
            ref={calendarRef}
            type="single"
            value={selectedDate}
            onDayClick={handleDayClick}
            onPageChange={handlePageChange}
            renderDay={renderDay}
          />

          {/* 选中日期的事件详情 */}
          {showDetails && selectedEvents.length > 0 && (
            <View className="mt-30rpx border-t border-gray-2 pt-30rpx">
              <Text className="mb-20rpx block text-28rpx text-gray-7 font-bold">
                {dayjs(selectedDate).format("MM月DD日")} 的事件
              </Text>
              <View className="space-y-20rpx">
                {selectedEvents.map(event => (
                  <View key={event.id} className="rounded-12rpx bg-gray-1 p-24rpx">
                    <View className="mb-8rpx flex items-center justify-between">
                      <View className="flex items-center gap-8rpx">
                        <Text className="text-24rpx">{getImportanceTag(event.importance)}</Text>
                        <Text className="text-28rpx text-gray-8 font-medium">{event.title}</Text>
                      </View>
                      <Text className="text-24rpx text-gray-5">{event.time}</Text>
                    </View>
                    {event.description && (
                      <Text className="text-24rpx text-gray-6 leading-relaxed">{event.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}

      {/* 说明 */}
      <View className="mt-30rpx flex items-center justify-center gap-30rpx border-t border-gray-2 pt-20rpx">
        <View className="flex items-center gap-8rpx">
          <Text className="text-24rpx">🔴</Text>
          <Text className="text-22rpx text-gray-6">高重要</Text>
        </View>
        <View className="flex items-center gap-8rpx">
          <Text className="text-24rpx">🟠</Text>
          <Text className="text-22rpx text-gray-6">中重要</Text>
        </View>
        <View className="flex items-center gap-8rpx">
          <Text className="text-24rpx">🔵</Text>
          <Text className="text-22rpx text-gray-6">低重要</Text>
        </View>
      </View>
    </View>
  );
}
