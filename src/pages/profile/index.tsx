import { Avatar, Cell } from "@nutui/nutui-react-taro";
import { View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import PageWrapper from "~/components/page-wrapper";

interface UserInfo {
  nickName: string;
  avatarUrl: string;
}

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    // 尝试从缓存读取用户信息
    const cachedUserInfo = Taro.getStorageSync("userInfo");
    if (cachedUserInfo) {
      setUserInfo(cachedUserInfo);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const { userInfo: wxUserInfo } = await Taro.getUserProfile({
        desc: "用于完善会员资料",
      });
      const info = {
        nickName: wxUserInfo.nickName,
        avatarUrl: wxUserInfo.avatarUrl,
      };
      setUserInfo(info);
      Taro.setStorageSync("userInfo", info);
    } catch (error) {
      console.log("用户取消授权", error);
    }
  };

  const handleSettings = () => {
    Taro.showToast({
      title: "功能开发中",
      icon: "none",
    });
  };

  return (
    <View className="index-page" style={{ height: "100vh", overflow: "hidden" }}>
      <View className="index-page__content" style={{ height: "100%", overflow: "auto" }}>
        <PageWrapper title="个人中心" showHeader headerStyle="centered">
          <View className="mb-16rpx rd-12rpx bg-white p-24rpx">
            {userInfo ? (
              <View className="flex items-center">
                <Avatar size="large" src={userInfo.avatarUrl} />
                <View className="ml-20rpx flex-1">
                  <View className="mb-4rpx text-30rpx text-gray-8 font-600">{userInfo.nickName}</View>
                  <View className="text-22rpx text-gray-5">微信用户</View>
                </View>
              </View>
            ) : (
              <View className="flex items-center" onClick={handleLogin}>
                <Avatar size="large" />
                <View className="ml-20rpx flex-1">
                  <View className="mb-4rpx text-30rpx text-gray-8 font-600">点击登录</View>
                  <View className="text-22rpx text-gray-5">获取微信信息</View>
                </View>
              </View>
            )}
          </View>

          <View className="overflow-hidden rd-12rpx bg-white">
            <Cell title="通用设置" description="主题、语言、通知等" align="center" onClick={handleSettings} />
            <Cell
              title="清除缓存"
              description="清理本地缓存数据"
              align="center"
              onClick={() => {
                Taro.showModal({
                  title: "确认清除",
                  content: "确定要清除所有缓存数据吗？",
                  success: res => {
                    if (res.confirm) {
                      Taro.showToast({
                        title: "清除成功",
                        icon: "success",
                      });
                    }
                  },
                });
              }}
            />
            <Cell title="关于应用" description="版本 0.0.7" align="center" onClick={handleSettings} />
          </View>
        </PageWrapper>
      </View>
    </View>
  );
}
