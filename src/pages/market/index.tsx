import { Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import PageWrapper from "~/components/page-wrapper";

interface SinaLiveItem {
  id: string;
  rich_text?: string;
  title?: string;
  create_time?: string; // "2026-03-13 16:06:25"
  docurl?: string;
  tag?: Array<{ name?: string }>;
}

interface SinaLiveResponse {
  result?: {
    data?: {
      feed?: {
        list?: SinaLiveItem[];
      };
    };
  };
}

// 新浪财经 7x24 小时直播电报流（财经直播间 ID 152）
// 注意：接口为 JSONP，我们在小程序里请求时 dataType 使用 "text"，手动去掉回调包装再解析。
const SINA_LIVE_URL =
  "https://zhibo.sina.com.cn/api/zhibo/feed?page=1&page_size=50&zhibo_id=152&tag_id=0&dire=f&dpc=1&type=0";

function formatDateTime(timestampMs: number) {
  const date = new Date(timestampMs);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

function formatTimeLabel(timeStr?: string) {
  if (!timeStr) {
    return "";
  }
  const parts = timeStr.split(" ");
  return parts[1] || parts[0] || "";
}

export default function MarketPage() {
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<SinaLiveItem[]>([]);

  const loadTelegraphs = async () => {
    try {
      setError(null);
      if (!items.length) {
        setLoading(true);
      }

      const res = await Taro.request<string>({
        url: SINA_LIVE_URL,
        method: "GET",
        dataType: "text",
      });
      const text = res.data || "";
      const jsonMatch = text.match(/^[^(]*\(([\s\S]*?)\)\s*(?:;\s*)?$/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;

      let payload: SinaLiveResponse | null = null;
      try {
        payload = JSON.parse(jsonText) as SinaLiveResponse;
      } catch (parseError) {
        console.error("解析新浪财经直播数据失败:", parseError);
        if (!items.length) {
          setError("解析新浪财经直播数据失败");
        }
        setItems([]);
        return;
      }

      const list = (payload?.result?.data?.feed?.list || []) as any[];
      const normalized: SinaLiveItem[] = list
        .filter(it => it && (it.create_time || it.rich_text || it.title))
        .map(it => {
          const text = (it.rich_text as string | undefined) || (it.title as string | undefined) || "";
          const createTime = (it.create_time as string | undefined) || "";
          return {
            id: String(it.id ?? createTime),
            rich_text: text,
            create_time: createTime,
            docurl: (it.docurl as string | undefined) || "",
            tag: (it.tag as Array<{ name?: string }> | undefined) || [],
          };
        })
        .sort((a, b) => {
          if (!a.create_time || !b.create_time) {
            return 0;
          }
          return a.create_time < b.create_time ? 1 : -1;
        });

      setItems(normalized);
    } catch (e) {
      console.error("加载新浪财经直播失败:", e);
      if (!items.length) {
        setError("加载市场快讯失败，请稍后重试");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTelegraphs();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    const refreshTimer = setInterval(() => {
      loadTelegraphs();
    }, 1000 * 30);

    return () => {
      clearInterval(timer);
      clearInterval(refreshTimer);
    };
  }, [items.length]);

  const handleManualRefresh = async () => {
    await loadTelegraphs();
    Taro.showToast({
      title: "已刷新",
      icon: "none",
    });
  };

  return (
    <View className="index-page" style={{ height: "100vh" }}>
      <PageWrapper title="市场行情" showHeader headerStyle="centered" contentPadding={false}>
        <View className="bg-gray-50 px-20rpx py-16rpx">
          <View className="mb-20rpx flex items-center justify-between rounded-16rpx bg-blue-50 px-20rpx py-16rpx">
            <View>
              <Text className="mb-6rpx block text-28rpx text-blue-8 font-600">新浪财经直播</Text>
              <Text className="text-22rpx text-gray-6">{formatDateTime(now)}</Text>
            </View>
            <View
              className="rounded-full bg-blue-500 px-24rpx py-10rpx text-24rpx text-white"
              onClick={handleManualRefresh}
            >
              刷新
            </View>
          </View>

          {loading && !items.length ? (
            <View className="py-80rpx text-center text-26rpx text-gray-5">
              <Text>正在加载市场快讯...</Text>
            </View>
          ) : error ? (
            <View className="py-80rpx text-center text-26rpx text-red-500">
              <Text>{error}</Text>
            </View>
          ) : (
            <View className="space-y-12rpx">
              {items.map(item => {
                const timeLabel = formatTimeLabel(item.create_time);
                return (
                  <View key={item.id} className="rounded-12rpx bg-white px-20rpx py-14rpx">
                    <View className="mb-6rpx flex">
                      <View className="mr-10rpx">
                        <Text className="rounded-6rpx bg-amber-100 px-12rpx py-4rpx text-20rpx text-amber-700">
                          {timeLabel}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-24rpx text-gray-8 leading-relaxed">{item.rich_text}</Text>
                        {(item.tag && item.tag.length > 0) || item.docurl ? (
                          <View className="mt-6rpx flex items-center justify-between">
                            <View className="flex flex-wrap items-center gap-6rpx">
                              {item.tag?.map((t, idx) => (
                                <View
                                  key={`${item.id}-${idx}`}
                                  className="flex items-center justify-center rounded-6rpx bg-emerald-100 px-10rpx py-4rpx"
                                >
                                  <Text className="text-20rpx text-emerald-700">{t.name}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View className="py-32rpx text-center text-22rpx text-gray-4">
            <Text>数据来自新浪财经直播，仅供参考，投资需谨慎</Text>
          </View>
        </View>
      </PageWrapper>
    </View>
  );
}
