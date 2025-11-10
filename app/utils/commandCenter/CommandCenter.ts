import { Tool, ToolCall } from "./types";

/**
 * 指令处理器接口
 */
export interface CommandHandler {
  /** 工具定义 */
  tool: Tool;
  /** 执行函数 */
  execute: (args: Record<string, any>) => Promise<any> | any;
}

/**
 * 指令执行结果
 */
export interface CommandResult {
  success: boolean;
  toolName: string;
  data?: any;
  error?: string;
}

/**
 * 统一指令中心
 * 负责指令的注册、管理和分发
 */
class CommandCenterClass {
  /** 指令处理器映射表: toolName -> handler */
  private handlers: Map<string, CommandHandler> = new Map();

  /**
   * 注册指令处理器
   * @param handler 指令处理器
   */
  register(handler: CommandHandler): void {
    const toolName = handler.tool.function.name;

    if (this.handlers.has(toolName)) {
      console.warn(`⚠️ 指令 "${toolName}" 已存在，请更改指令 name`);
      return;
    }

    this.handlers.set(toolName, handler);
    console.log(`✅ 注册指令: ${toolName}`);
  }

  /**
   * 批量注册指令处理器
   * @param handlers 指令处理器数组
   */
  registerBatch(handlers: CommandHandler[]): void {
    handlers.forEach((handler) => this.register(handler));
  }

  /**
   * 注销指令处理器
   * @param toolName 工具名称
   */
  unregister(toolName: string): void {
    if (this.handlers.delete(toolName)) {
      console.log(`🗑️ 注销指令: ${toolName}`);
    }
  }

  /**
   * 获取所有已注册的工具定义
   * @returns 工具定义数组
   */
  getTools(): Tool[] {
    return Array.from(this.handlers.values()).map((handler) => handler.tool);
  }

  /**
   * 获取指定工具的定义
   * @param toolName 工具名称
   */
  getTool(toolName: string): Tool | undefined {
    return this.handlers.get(toolName)?.tool;
  }

  /**
   * 执行单个工具调用
   * @param toolCall 工具调用信息
   * @returns 执行结果
   */
  async executeToolCall(toolCall: ToolCall): Promise<CommandResult> {
    const toolName = toolCall.function.name;
    const handler = this.handlers.get(toolName);

    if (!handler) {
      console.error(`❌ 未找到指令处理器: ${toolName}`);
      return {
        success: false,
        toolName,
        error: `未找到指令处理器: ${toolName}`,
      };
    }

    try {
      const args = JSON.parse(toolCall.function.arguments || "{}");
      console.log(`📝 执行指令: ${toolName}`, args);

      const result = await handler.execute(args);

      console.log(`✅ 指令执行成功: ${toolName}`);
      return {
        success: true,
        toolName,
        data: result,
      };
    } catch (error) {
      console.error(`❌ 指令执行失败: ${toolName}`, error);
      return {
        success: false,
        toolName,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 批量执行工具调用
   * @param toolCalls 工具调用列表
   * @returns 执行结果数组
   */
  async executeToolCalls(toolCalls: ToolCall[]): Promise<CommandResult[]> {
    const results: CommandResult[] = [];

    for (const toolCall of toolCalls) {
      const result = await this.executeToolCall(toolCall);
      results.push(result);
    }

    return results;
  }

  /**
   * 检查指令是否已注册
   * @param toolName 工具名称
   */
  hasCommand(toolName: string): boolean {
    return this.handlers.has(toolName);
  }

  /**
   * 获取所有已注册的指令名称
   */
  getCommandNames(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * 清空所有指令处理器
   */
  clear(): void {
    console.log("🧹 清空所有指令处理器");
    this.handlers.clear();
  }

  /**
   * 获取指令数量
   */
  get size(): number {
    return this.handlers.size;
  }
}

/**
 * 全局指令中心实例
 */
export const CommandCenter = new CommandCenterClass();

