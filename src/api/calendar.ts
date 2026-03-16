/**
 * 财经日历 API
 */

import type { CalendarEvent, ClsCalendarEvent, ImportanceLevel } from "~/types/calendar";
import type { ApiResponse } from "~/types/common";
import Taro from "@tarojs/taro";
import dayjs from "dayjs";

const isDev = process.env.NODE_ENV !== "production";

/**
 * 财联社财经日历接口
 * 注意：由于跨域限制，在小程序中可能需要配置服务器域名白名单
 * 或通过后端代理
 */
const CLS_CALENDAR_API = "https://www.cls.cn/api/calendar/web/list";

/**
 * 转换重要程度
 */
function convertImportance(importance?: number): ImportanceLevel {
  if (!importance) {
    return "low";
  }
  if (importance >= 3) {
    return "high";
  }
  if (importance >= 2) {
    return "medium";
  }
  return "low";
}

/**
 * 转换财联社事件为标准格式
 */
function convertClsEvent(clsEvent: ClsCalendarEvent): CalendarEvent {
  return {
    id: String(clsEvent.id),
    title: clsEvent.title || "未知事件",
    date: clsEvent.date || dayjs().format("YYYY-MM-DD"),
    time: clsEvent.time,
    type: "economic", // 默认为经济数据
    importance: convertImportance(clsEvent.importance),
    description: clsEvent.content,
    source: "财联社",
  };
}

/**
 * 生成模拟财经日历数据（用于开发和测试）
 */
function generateMockCalendarData(): CalendarEvent[] {
  const today = dayjs();
  const events: CalendarEvent[] = [];

  // 本周的模拟事件
  for (let i = 0; i < 7; i++) {
    const date = today.add(i, "day");
    const dateStr = date.format("YYYY-MM-DD");

    // 每天添加 1-3 个随机事件
    const eventCount = Math.floor(Math.random() * 3) + 1;

    for (let j = 0; j < eventCount; j++) {
      const eventTypes = [
        { title: "中国CPI数据", type: "economic" as const, importance: "high" as const },
        { title: "美联储议息会议", type: "policy" as const, importance: "high" as const },
        { title: "GDP数据发布", type: "economic" as const, importance: "high" as const },
        { title: "PMI数据", type: "economic" as const, importance: "medium" as const },
        { title: "央行公开市场操作", type: "policy" as const, importance: "medium" as const },
        { title: "重点公司财报", type: "earnings" as const, importance: "medium" as const },
        { title: "市场休市", type: "holiday" as const, importance: "low" as const },
      ];

      const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];

      events.push({
        id: `${dateStr}-${j}`,
        title: randomEvent.title,
        date: dateStr,
        time: `${9 + j * 2}:30`,
        type: randomEvent.type,
        importance: randomEvent.importance,
        description: `${randomEvent.title}的详细说明信息`,
        previous: randomEvent.type === "economic" ? "2.5%" : undefined,
        forecast: randomEvent.type === "economic" ? "2.8%" : undefined,
        source: "模拟数据",
      });
    }
  }

  return events.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) {
      return dateCompare;
    }
    return (a.time || "").localeCompare(b.time || "");
  });
}

/**
 * 获取财经日历数据
 * @param startDate 开始日期 YYYY-MM-DD
 * @param endDate 结束日期 YYYY-MM-DD
 * @returns 财经日历事件列表
 */
export async function getCalendarEvents(startDate?: string, endDate?: string): Promise<ApiResponse<CalendarEvent[]>> {
  try {
    // 默认获取未来7天的数据
    const start = startDate || dayjs().format("YYYY-MM-DD");
    const end = endDate || dayjs().add(7, "day").format("YYYY-MM-DD");

    if (isDev) {
      console.log(`[API] 获取财经日历数据: ${start} ~ ${end}`);
    }

    // 由于财联社接口可能存在跨域或权限问题
    // 这里先使用模拟数据，实际使用时可切换到真实接口
    const USE_MOCK_DATA = true;

    if (USE_MOCK_DATA) {
      const mockData = generateMockCalendarData();
      return {
        code: 200,
        message: "success",
        success: true,
        data: mockData,
      };
    }

    // 真实 API 调用（需要配置域名白名单或后端代理）
    try {
      const response = await Taro.request<{
        code: number;
        data: ClsCalendarEvent[];
        [key: string]: any;
      }>({
        url: CLS_CALENDAR_API,
        method: "GET",
        data: {
          app: "CailianpressWeb",
          flag: 0,
          os: "web",
          sv: "8.4.6",
          type: 0,
          startDate: start,
          endDate: end,
        },
        header: {
          "content-type": "application/json",
        },
      });

      if (response.statusCode === 200 && response.data?.data) {
        const events = response.data.data.map(convertClsEvent);
        if (isDev) {
          console.log(`[API] 成功获取 ${events.length} 条财经日历数据`);
        }
        return {
          code: 200,
          message: "success",
          success: true,
          data: events,
        };
      }

      throw new Error("获取数据失败");
    } catch (error) {
      console.warn("财联社接口调用失败，使用模拟数据:", error);
      // 接口失败时降级使用模拟数据
      const mockData = generateMockCalendarData();
      return {
        code: 200,
        message: "success (mock data)",
        success: true,
        data: mockData,
      };
    }
  } catch (error) {
    console.error("获取财经日历数据失败:", error);
    return {
      code: 500,
      message: "获取财经日历数据失败",
      success: false,
      data: [],
    };
  }
}

/**
 * 获取今日重要事件
 * @returns 今日重要事件列表
 */
export async function getTodayImportantEvents(): Promise<ApiResponse<CalendarEvent[]>> {
  try {
    const today = dayjs().format("YYYY-MM-DD");
    const response = await getCalendarEvents(today, today);

    if (response.success && response.data) {
      // 过滤出重要和高重要度的事件
      const importantEvents = response.data.filter(
        event => event.importance === "high" || event.importance === "medium",
      );

      return {
        ...response,
        data: importantEvents,
      };
    }

    return response;
  } catch (error) {
    console.error("获取今日重要事件失败:", error);
    return {
      code: 500,
      message: "获取今日重要事件失败",
      success: false,
      data: [],
    };
  }
}
