import { Text, View } from "@tarojs/components";
import { useEffect } from "react";
import AppTabbar from "~/components/AppTabbar";
import PageWrapper from "~/components/page-wrapper";
import { useAppStore } from "~/store/useAppStore";

export default function ProfilePage() {
  const setActiveTabKey = useAppStore(state => state.setActiveTabKey);

  useEffect(() => {
    setActiveTabKey("profile");
  }, [setActiveTabKey]);

  return (
    <View className="index-page" style={{ height: "100vh", overflow: "hidden" }}>
      <View className="index-page__content" style={{ height: "100%", overflow: "auto" }}>
        <PageWrapper title="我的" showHeader headerStyle="centered">
          <View className="text-center text-32rpx text-gray-5">
            <Text>个人中心页面开发中...</Text>
          </View>
        </PageWrapper>
      </View>
      <AppTabbar />
    </View>
  );
}
