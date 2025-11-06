/**
 * 应用常量配置
 */

export const APP_NAME = "Loggy";
export const APP_DEFAULT_TITLE = "Loggy";
export const APP_TITLE_TEMPLATE = "%s - Loggy";
export const APP_DESCRIPTION = "智能助手，随时为您提供帮助";

export const APP_MANIFEST = {
  name: "Loggy-AI",
  short_name: "Loggy",
  description: APP_DESCRIPTION,
  start_url: "/",
  display: "standalone" as const,
  background_color: "#ffffff",
  theme_color: "#6b7280",
} as const;

export const TYPED_CONFIG = {
  strings: ["欢迎使用 Loggy"] as string[],
  typeSpeed: 60,
  showCursor: false,
  autoInsertCss: true,
};
