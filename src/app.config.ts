export default defineAppConfig({
  pages: [
    "pages/home/index",
    "pages/fund-list/index",
    "pages/holdings/index",
    "pages/profile/index",
    "pages/index/index",
    "pages/fund-detail/index",
    "pages/add-holdings/index",
  ],
  window: {
    navigationStyle: "custom",
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "基金监控",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    color: "#999999",
    selectedColor: "#1677ff",
    backgroundColor: "#ffffff",
    borderStyle: "black",
    list: [
      {
        pagePath: "pages/home/index",
        text: "首页",
        iconPath: "assets/icons/home.png",
        selectedIconPath: "assets/icons/home-active.png",
      },
      {
        pagePath: "pages/fund-list/index",
        text: "基金",
        iconPath: "assets/icons/fund.png",
        selectedIconPath: "assets/icons/fund-active.png",
      },
      {
        pagePath: "pages/holdings/index",
        text: "持仓",
        iconPath: "assets/icons/holdings.png",
        selectedIconPath: "assets/icons/holdings-active.png",
      },
      {
        pagePath: "pages/profile/index",
        text: "我的",
        iconPath: "assets/icons/profile.png",
        selectedIconPath: "assets/icons/profile-active.png",
      },
    ],
  },
});
