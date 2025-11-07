/**
 * 聊天相关类型定义
 */

/**
 * 消息角色
 */
export type MessageRole = "user" | "assistant";

/**
 * 消息
 */
export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
}

/**
 * Typed.js 配置
 */
export interface TypedConfig {
  strings: string[];
  typeSpeed: number;
  showCursor: boolean;
  autoInsertCss: boolean;
}

/**
 * Deepseek Chat API 请求参数
 */
export interface ChatRequestParams {
  model?: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
  [key: string]: unknown; // 允许其他参数透传
}

/**
 * SSE 事件类型
 */
export type SSEEventType = "content" | "done" | "error";

/**
 * SSE 事件
 */
export interface SSEEvent {
  type: SSEEventType;
  data?: string;
  error?: string;
}

/**
 * 聊天统计信息
 */
export interface ChatStats {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  thisWeek: number;
  thisMonth: number;
}

