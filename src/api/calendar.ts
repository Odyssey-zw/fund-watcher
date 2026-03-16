/**
 * 财经日历 API
 * 使用预定义财经事件数据
 */

import type { CalendarEvent } from "~/types/calendar";
import type { ApiResponse } from "~/types/common";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

// 扩展 dayjs 插件
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const isDev = process.env.NODE_ENV !== "production";

/**
 * 预定义的重要财经事件（按月份）
 * 这些是相对固定的重要经济数据/事件的常规发布时间
 */
const PREDEFINED_EVENTS = [
  // 每月上旬（1-10日）
  {
    day: 1,
    title: "官方制造业PMI",
    time: "09:00",
    importance: "high" as const,
    description: "采购经理人指数，反映制造业景气度，属于先行指标",
  },
  {
    day: 1,
    title: "非制造业PMI",
    time: "09:00",
    importance: "medium" as const,
    description: "服务业与建筑业景气度指标，反映内需情况",
  },
  {
    day: 5,
    title: "财新中国制造业PMI",
    time: "09:45",
    importance: "medium" as const,
    description: "偏向中小企业的制造业景气度指标",
  },
  {
    day: 9,
    title: "中国CPI数据",
    time: "09:30",
    importance: "high" as const,
    description: "居民消费价格指数，反映通胀水平，影响货币政策预期",
  },
  {
    day: 9,
    title: "中国PPI数据",
    time: "09:30",
    importance: "high" as const,
    description: "工业品出厂价格指数，反映上游价格变化及企业盈利压力",
  },

  // 每月中旬（11-20日）
  {
    day: 15,
    title: "社会融资规模数据",
    time: "10:00",
    importance: "medium" as const,
    description: "反映金融对实体经济的支持力度，是信用周期的重要参考",
  },
  {
    day: 15,
    title: "新增人民币贷款",
    time: "10:00",
    importance: "medium" as const,
    description: "银行信贷投放情况，体现资金宽松或收紧程度",
  },
  {
    day: 16,
    title: "房地产投资数据",
    time: "10:00",
    importance: "medium" as const,
    description: "房地产开发投资及销售情况，影响地产链与相关行业",
  },
  {
    day: 17,
    title: "规模以上工业增加值",
    time: "10:00",
    importance: "high" as const,
    description: "工业生产景气度指标，对周期板块和大宗商品影响较大",
  },
  {
    day: 17,
    title: "社会消费品零售总额",
    time: "10:00",
    importance: "high" as const,
    description: "消费景气度核心指标，影响可选消费与必选消费板块",
  },
  {
    day: 18,
    title: "城镇固定资产投资",
    time: "10:00",
    importance: "medium" as const,
    description: "反映基建、制造业、地产等领域的投资力度",
  },

  // 每月末（21-31日）
  {
    day: 20,
    title: "一年期LPR报价",
    time: "09:15",
    importance: "high" as const,
    description: "贷款市场报价利率，影响企业与居民贷款利率定价",
  },
  {
    day: 20,
    title: "五年期以上LPR报价",
    time: "09:15",
    importance: "high" as const,
    description: "中长期贷款及房贷定价基准，影响房地产与银行板块",
  },
  {
    day: 25,
    title: "财新中国服务业PMI",
    time: "09:45",
    importance: "medium" as const,
    description: "反映服务业活动状况，侧重私营与中小企业",
  },
  {
    day: 28,
    title: "规模以上工业企业利润",
    time: "09:30",
    importance: "medium" as const,
    description: "反映工业企业盈利情况，与股市盈利预期高度相关",
  },
];

/**
 * 生成当前月份的财经日历事件
 */
function generateMonthlyEvents(targetDate: string = dayjs().format("YYYY-MM-DD")): CalendarEvent[] {
  const date = dayjs(targetDate);
  const year = date.year();
  const month = date.month() + 1; // dayjs month 从 0 开始
  const daysInMonth = date.daysInMonth();

  const events: CalendarEvent[] = [];

  PREDEFINED_EVENTS.forEach(event => {
    // 只生成该月实际存在的日期
    if (event.day <= daysInMonth) {
      const eventDate = dayjs(`${year}-${String(month).padStart(2, "0")}-${String(event.day).padStart(2, "0")}`);
      events.push({
        id: `${eventDate.format("YYYY-MM-DD")}-${event.title}`,
        title: event.title,
        date: eventDate.format("YYYY-MM-DD"),
        time: event.time,
        type: "economic",
        importance: event.importance,
        description: event.description,
        source: "预设事件",
      });
    }
  });

  return events;
}

/**
 * 过滤指定日期范围的事件
 */
function filterEventsByDateRange(events: CalendarEvent[], startDate: string, endDate: string): CalendarEvent[] {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  return events.filter(event => {
    const eventDate = dayjs(event.date);
    return eventDate.isSameOrAfter(start, "day") && eventDate.isSameOrBefore(end, "day");
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

    // 生成本月和下月的事件（覆盖未来7天）
    const startMonth = dayjs(start);
    const endMonth = dayjs(end);

    let allEvents: CalendarEvent[] = [];

    // 生成开始月份的事件
    allEvents = allEvents.concat(generateMonthlyEvents(start));

    // 如果跨月，生成结束月份的事件
    if (startMonth.month() !== endMonth.month()) {
      allEvents = allEvents.concat(generateMonthlyEvents(end));
    }

    // 过滤出指定日期范围内的事件
    const filteredEvents = filterEventsByDateRange(allEvents, start, end);

    if (isDev) {
      console.log(`[API] 成功生成 ${filteredEvents.length} 条财经日历数据`);
    }

    return {
      code: 200,
      message: "success",
      success: true,
      data: filteredEvents,
    };
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
