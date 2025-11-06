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

/**
 * Deepseek Chat API 请求参数（透传给前端）
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

export interface SSEEvent {
  type: SSEEventType;
  data?: string;
  error?: string;
}
