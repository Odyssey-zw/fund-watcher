import Taro from "@tarojs/taro";
import { useEffect } from "react";
import { useAppStore } from "~/store/useAppStore";

export default function Index() {
  const activeTabKey = useAppStore(state => state.activeTabKey);

  useEffect(() => {
    // 根据 store 中的 activeTabKey 重定向到对应页面
    const pathMap = {
      home: "/pages/home/index",
      fund: "/pages/fund-list/index",
      position: "/pages/position/index",
      profile: "/pages/profile/index",
    };

    const targetPath = pathMap[activeTabKey] || "/pages/home/index";

    Taro.redirectTo({
      url: targetPath,
    }).catch(() => {
      // 如果重定向失败,尝试使用 switchTab
      Taro.switchTab({
        url: targetPath,
      }).catch(error => {
        console.error("Navigation failed:", error);
      });
    });
  }, [activeTabKey]);

  return null;
}
