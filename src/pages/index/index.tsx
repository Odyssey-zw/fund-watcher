import Taro from "@tarojs/taro";
import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    // 重定向到首页
    Taro.switchTab({
      url: "/pages/home/index",
    }).catch(error => {
      console.error("Navigation failed:", error);
    });
  }, []);

  return null;
}
