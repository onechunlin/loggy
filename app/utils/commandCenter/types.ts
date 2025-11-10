/**
 * AI工具调用信息
 */
export interface ToolCall {
  type: "function";
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

/**
 * AI工具定义
 */
export interface Tool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

