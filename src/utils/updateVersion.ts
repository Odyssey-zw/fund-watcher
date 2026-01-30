import Taro from "@tarojs/taro";

/**
 * 检查并更新小程序版本
 */
export function updateVersion(): void {
  if (Taro.getUpdateManager) {
    const updateManager = Taro.getUpdateManager();

    updateManager.onCheckForUpdate(res => {
      console.log("检查更新结果:", res.hasUpdate);
    });

    updateManager.onUpdateReady(() => {
      Taro.showModal({
        title: "更新提示",
        content: "新版本已经准备好，是否重启应用？",
        success: res => {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        },
      });
    });

    updateManager.onUpdateFailed(() => {
      console.error("新版本下载失败");
      Taro.showToast({
        title: "更新失败",
        icon: "none",
      });
    });
  }
}

/**
 * 获取当前小程序版本信息
 */
export function getCurrentVersion(): Promise<{
  version: string;
  envVersion: string;
}> {
  return new Promise(resolve => {
    const accountInfo = Taro.getAccountInfoSync();
    resolve({
      version: accountInfo.miniProgram.version || "1.0.0",
      envVersion: accountInfo.miniProgram.envVersion || "release",
    });
  });
}
