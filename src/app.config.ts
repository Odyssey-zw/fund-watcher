export default defineAppConfig({
  pages: [
    "pages/index/index",
    "pages/home/index",
    "pages/fund-list/index",
    "pages/position/index",
    "pages/profile/index",
    "pages/fund-detail/index",
    "pages/add-position/index",
  ],
  window: {
    navigationStyle: "custom",
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "基金监控",
    navigationBarTextStyle: "black",
  },
});
