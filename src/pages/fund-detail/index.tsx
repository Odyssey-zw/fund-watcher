import { Text, View } from "@tarojs/components";
import { useLoad } from "@tarojs/taro";

export default function FundDetail() {
  useLoad(() => {
    console.log("Page loaded: FundDetail");
  });

  return (
    <View className="min-h-screen bg-gray-1 p-30rpx">
      <View className="mb-40rpx pt-40rpx text-center">
        <Text className="text-40rpx text-gray-8 font-bold">基金详情</Text>
      </View>
      <View className="text-center text-32rpx text-gray-5">
        <Text>基金详情页面开发中...</Text>
      </View>
    </View>
  );
}
