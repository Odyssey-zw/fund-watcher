import { Text, View } from "@tarojs/components";
import PageWrapper from "~/components/page-wrapper";
import "./index.scss";

export default function Position() {
  return (
    <PageWrapper title="我的持仓" showHeader headerStyle="centered">
      <View className="position-content">
        <Text>持仓管理页面开发中...</Text>
      </View>
    </PageWrapper>
  );
}
