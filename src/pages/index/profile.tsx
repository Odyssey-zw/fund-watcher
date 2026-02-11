import { Text, View } from "@tarojs/components";
import PageWrapper from "~/components/page-wrapper";

export default function Profile() {
  return (
    <PageWrapper title="我的" showHeader headerStyle="centered">
      <View className="text-center text-32rpx text-gray-5">
        <Text>个人中心页面开发中...</Text>
      </View>
    </PageWrapper>
  );
}
