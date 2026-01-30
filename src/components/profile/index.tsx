import { Text, View } from "@tarojs/components";
import "./index.scss";

export default function Profile() {
  return (
    <View className="profile-component">
      <View className="header">
        <Text className="title">我的</Text>
      </View>
      <View className="content">
        <Text>个人中心页面开发中...</Text>
      </View>
    </View>
  );
}
