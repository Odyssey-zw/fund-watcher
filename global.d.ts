/**
 * 全局类型定义文件
 */

// Taro 全局函数声明
declare const defineAppConfig: (config: any) => any;
declare const definePageConfig: (config: any) => any;

// 环境变量声明
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    TARO_ENV: "weapp" | "alipay" | "swan" | "tt" | "qq" | "jd" | "h5" | "rn";
    TARO_APP_ENV?: string;
    TARO_APP_API_URL?: string;
    TARO_APP_DEBUG?: string;
    VERSION?: string;
    AUTHOR?: string;
  }
}

// CSS Modules 类型声明
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.sass" {
  const classes: { [key: string]: string };
  export default classes;
}

// 静态资源类型声明
declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

// 样式文件类型声明
declare module "*.css" {
  const content: any;
  export default content;
}

declare module "*.scss" {
  const content: any;
  export default content;
}

declare module "*.sass" {
  const content: any;
  export default content;
}

// UnoCSS 声明
declare module "uno.css" {
  const content: any;
  export default content;
}

// 小程序全局对象类型扩展
declare global {
  interface Window {
    wx?: any;
    my?: any;
    tt?: any;
    swan?: any;
  }

  const wx: any;
  const my: any;
  const tt: any;
  const swan: any;
}

export {};
