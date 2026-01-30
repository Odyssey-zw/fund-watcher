import { Text, View } from "@tarojs/components";
import PageWrapper from "~/components/page-wrapper";
import "./index.scss";

export default function Profile() {
  return (
    <PageWrapper title="我的" showHeader headerStyle="centered">
      <View className="profile-content">
        <Text>个人中心页面开发中...</Text>
      </View>
    </PageWrapper>
  );
}
