/**
 * 全局类型定义
 */

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  role: "user" | "assistant";
}

export interface TypedConfig {
  strings: string[];
  typeSpeed: number;
  showCursor: boolean;
  autoInsertCss: boolean;
}
