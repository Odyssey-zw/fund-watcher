import { Text, View } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";
import "./index.scss";

export default function FundDetail() {
  useLoad(() => {
    console.log("Page loaded: FundDetail");
  });

  return (
    <View className="fund-detail-page">
      <View className="header">
        <Text className="title">基金详情</Text>
      </View>
      <View className="content">
        <Text>基金详情页面开发中...</Text>
      </View>
    </View>
  );
}
