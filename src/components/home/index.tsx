import { Text, View } from "@tarojs/components";
import "./index.scss";

export default function Home() {
  return (
    <View className="home-component">
      <View className="header">
        <Text className="title">基金监控</Text>
        <Text className="subtitle">Fund Watcher</Text>
      </View>

      <View className="content">
        <View className="welcome-card">
          <Text className="welcome-text">欢迎使用基金监控小程序</Text>
          <Text className="description">
            实时监控基金净值变化，管理您的投资组合
          </Text>
        </View>

        <View className="feature-grid">
          <View className="feature-item">
            <View className="feature-icon">📈</View>
            <Text className="feature-title">实时净值</Text>
            <Text className="feature-desc">获取最新基金净值信息</Text>
          </View>

          <View className="feature-item">
            <View className="feature-icon">📊</View>
            <Text className="feature-title">收益分析</Text>
            <Text className="feature-desc">详细的收益数据分析</Text>
          </View>

          <View className="feature-item">
            <View className="feature-icon">💰</View>
            <Text className="feature-title">持仓管理</Text>
            <Text className="feature-desc">管理您的基金投资组合</Text>
          </View>

          <View className="feature-item">
            <View className="feature-icon">🔔</View>
            <Text className="feature-title">价格提醒</Text>
            <Text className="feature-desc">设置价格变动通知</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
