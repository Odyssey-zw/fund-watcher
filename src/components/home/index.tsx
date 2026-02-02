import { Text, View } from "@tarojs/components";

export default function Home() {
  return (
    <View
      className="min-h-full from-blue-5 to-purple-6 bg-gradient-to-br px-30rpx pb-0"
      style={{
        paddingTop: "calc(constant(safe-area-inset-top, 44px) + 48rpx)",
      }}
    >
      <View className="mb-60rpx pt-40rpx text-center">
        <Text className="mb-20rpx block text-56rpx text-white font-bold">
          基金监控
        </Text>
        <Text
          className="block text-28rpx text-white/80"
          style={{ letterSpacing: "2rpx" }}
        >
          Fund Watcher
        </Text>
      </View>

      <View>
        <View className="mb-50rpx rounded-24rpx bg-white/95 p-50rpx px-40rpx text-center shadow-lg">
          <Text className="mb-20rpx block text-36rpx text-gray-8 font-bold">
            欢迎使用基金监控小程序
          </Text>
          <Text className="block text-28rpx text-gray-6 leading-relaxed">
            实时监控基金净值变化，管理您的投资组合
          </Text>
        </View>

        <View className="grid grid-cols-2 gap-30rpx">
          <View className="rounded-20rpx bg-white/95 p-40rpx px-20rpx text-center shadow-md transition-transform duration-200 active:scale-95">
            <View className="mb-20rpx text-48rpx">📈</View>
            <Text className="mb-16rpx block text-30rpx text-gray-8 font-bold">
              实时净值
            </Text>
            <Text className="block text-24rpx text-gray-6 leading-snug">
              获取最新基金净值信息
            </Text>
          </View>

          <View className="rounded-20rpx bg-white/95 p-40rpx px-20rpx text-center shadow-md transition-transform duration-200 active:scale-95">
            <View className="mb-20rpx text-48rpx">📊</View>
            <Text className="mb-16rpx block text-30rpx text-gray-8 font-bold">
              收益分析
            </Text>
            <Text className="block text-24rpx text-gray-6 leading-snug">
              详细的收益数据分析
            </Text>
          </View>

          <View className="rounded-20rpx bg-white/95 p-40rpx px-20rpx text-center shadow-md transition-transform duration-200 active:scale-95">
            <View className="mb-20rpx text-48rpx">💰</View>
            <Text className="mb-16rpx block text-30rpx text-gray-8 font-bold">
              持仓管理
            </Text>
            <Text className="block text-24rpx text-gray-6 leading-snug">
              管理您的基金投资组合
            </Text>
          </View>

          <View className="rounded-20rpx bg-white/95 p-40rpx px-20rpx text-center shadow-md transition-transform duration-200 active:scale-95">
            <View className="mb-20rpx text-48rpx">🔔</View>
            <Text className="mb-16rpx block text-30rpx text-gray-8 font-bold">
              价格提醒
            </Text>
            <Text className="block text-24rpx text-gray-6 leading-snug">
              设置价格变动通知
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
