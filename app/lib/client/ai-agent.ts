/**
 * AI Agent Service
 * 负责与 DeepSeek API 通信，处理工具调用
 */

import { CommandCenter } from "@/app/utils/commandCenter";
import type { Tool, ToolCall } from "@/app/utils/commandCenter/types";

/**
 * AI Agent请求参数
 */
interface AgentRequest {
  query: string;
  /** 可用的工具列表 */
  tools?: Tool[];
  /** 系统提示词 */
  systemPrompt?: string;
  /** 对话历史 */
  history?: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
}

/**
 * AI Agent响应
 */
export interface AgentResponse {
  /** AI生成的文本内容 */
  content?: string;
  /** 需要调用的工具 */
  toolCalls?: ToolCall[];
  /** 是否完成 */
  isComplete: boolean;
  /** 错误信息 */
  error?: string;
}

export interface PreRequestResponse {
  /** 工具调用信息 */
  toolCalls: ToolCall[];
  /** 如果不需要工具调用，会直接回答 */
  answer?: string;
}

/**
 * AI Agent Service
 * 参考 MCP 的实现，支持工具调用
 */
export class AIAgentService {
  /**
   * 使用 DeepSeek API 进行工具调用
   * 通过服务端 API 路由调用
   */
  async processQueryWithDeepSeek(
    request: AgentRequest
  ): Promise<AgentResponse> {
    try {
      const messages: Array<{ role: string; content: string }> = [];
      if (request.systemPrompt) {
        messages.push({
          role: "system",
          content: request.systemPrompt,
        });
      }

      // 添加用户消息到历史
      messages.push({
        role: "user",
        content: request.query,
      });

      // 构造请求数据
      const tools = request.tools || [];
      const requestData: any = {
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.3, // 降低温度，提高响应速度
        max_tokens: 500, // 减少最大token数，加快响应
        stream: false, // 不使用流式响应
      };

      // 只有在有工具时才添加工具相关参数
      console.log(
        "🚀 ~ AIAgentService ~ processQueryWithDeepSeek ~ tools:",
        tools
      );
      if (tools.length > 0) {
        requestData.tools = tools;
        requestData.tool_choice = "required";
      }

      console.log("🤖 调用 DeepSeek API:", {
        model: requestData.model,
        messagesCount: messages.length,
        toolsCount: tools.length,
        maxTokens: requestData.max_tokens,
        temperature: requestData.temperature,
      });

      // 调用服务端 API（非流式响应）
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...requestData,
          stream: false, // 明确指定非流式响应
        }),
      });

      if (!response.ok) {
        throw new Error(`API 调用失败: ${response.status}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];

      if (!choice) {
        throw new Error("API 返回格式错误");
      }

      const message = choice.message;
      const agentResponse: AgentResponse = {
        content: message.content || undefined,
        toolCalls: [],
        isComplete: choice.finish_reason === "stop",
      };

      // 解析工具调用，清理工具名称末尾的多余引号
      if (message.tool_calls && message.tool_calls.length > 0) {
        agentResponse.toolCalls = message.tool_calls.map((tc: any) => {
          // 去除末尾的多余引号（单引号或双引号）
          const rawName = tc.function.name || "";
          const cleanName = rawName.replace(/["']+$/, "");

          // 如果工具名称被清理过，记录日志
          if (rawName !== cleanName) {
            console.warn(
              `⚠️ 工具名称包含多余引号，已自动清理: "${rawName}" -> "${cleanName}"`
            );
          }

          return {
            type: "function",
            function: {
              name: cleanName,
              arguments: tc.function.arguments,
            },
          };
        });

        console.log("🔧 DeepSeek 返回工具调用:", {
          count: agentResponse.toolCalls?.length || 0,
          tools: agentResponse.toolCalls?.map((t) => t.function.name) || [],
        });
      }

      console.log("✅ DeepSeek API 调用成功:", {
        hasContent: !!agentResponse.content,
        hasToolCalls: (agentResponse.toolCalls?.length || 0) > 0,
        isComplete: agentResponse.isComplete,
      });

      return agentResponse;
    } catch (error) {
      console.error("❌ DeepSeek API 调用异常:", error);
      return {
        isComplete: false,
        error: error instanceof Error ? error.message : "DeepSeek API 调用失败",
      };
    }
  }

  /**
   * 获取判断工具的工具定义
   */
  private getJudgeTool(): Tool {
    return {
      type: "function",
      function: {
        name: "judge_tool",
        description:
          "当用户需要执行操作（如导航、填表单、调整样式等）时，调用此工具指定需要的工具名称。如果用户只是问问题、咨询信息、闲聊，则不要调用此工具，直接回答即可。",
        parameters: {
          type: "object",
          properties: {
            tools: {
              type: "array",
              description: "需要调用的工具名称数组",
              items: {
                type: "string",
                enum: CommandCenter.getTools().map(
                  (tool) => tool.function.name
                ),
              },
              minItems: 1,
              maxItems: CommandCenter.getTools().length,
            },
            answer: {
              type: "string",
              description: "不需要工具调用时，直接返回的 AI 回复内容",
            },
          },
          required: ["tools"],
        },
      },
    };
  }

  /**
   * 生成预请求的系统提示词
   */
  private getPreRequestSystemPrompt(): string {
    const tools = CommandCenter.getTools();
    const toolsList = tools
      .map((tool) => `- ${tool.function.name}: ${tool.function.description}`)
      .join("\n");

    return `你是一个智能助手。根据用户的查询，判断是否需要使用工具。

可用的工具列表：
${toolsList}

判断规则：
1. 如果用户只是：
   - 问问题（如"什么是XXX"、"怎么XXX"）
   - 咨询信息（如"告诉我XXX"）
   - 闲聊对话（如"你好"、"谢谢"）
   - 寻求建议或解释
   => 不要调用任何工具，直接友好地回答用户的问题

2. 如果用户需要执行操作：
   - 导航跳转（如"去XXX页面"、"查看XXX"、"打开XXX"）
   - 填写或修改表单（如"填写XXX"、"修改XXX"）
   - 调整界面样式（如"把XXX调大"、"改成XXX颜色"）
   - 执行具体任务（如"调价"、"上传XXX"）
   => 调用 judge_tool 工具，指定需要使用的工具名称

请根据用户的实际意图做出判断。如果不需要工具，就直接回答；如果需要工具，就调用 judge_tool。`;
  }

  /**
   * 预请求，用于判断是否需要工具调用
   * 返回值：
   * - 如果不需要工具：toolCalls 为空，answer 包含 AI 的回复
   * - 如果需要工具：toolCalls 包含需要调用的工具信息
   */
  async preRequest(query: string): Promise<PreRequestResponse> {
    try {
      console.log("🔍 预请求 - 判断是否需要工具:", query);

      const response = await this.processQueryWithDeepSeek({
        query,
        tools: [this.getJudgeTool()],
        systemPrompt: this.getPreRequestSystemPrompt(),
      });
      const judgeToolCall = response.toolCalls?.[0];
      if (judgeToolCall) {
        try {
          const args = JSON.parse(judgeToolCall.function.arguments);
          const toolNames = args.tools || [];
          const answer = args.answer;

          console.log("🎯 需要调用工具:", {
            tools: toolNames,
            answer,
          });

          // 构造工具调用信息，清理工具名称末尾的多余引号
          const toolCalls: ToolCall[] = toolNames.map((name: string) => {
            return {
              type: "function" as const,
              function: {
                name,
                arguments: "{}", // 稍后由实际的工具调用填充参数
              },
            };
          });

          return {
            toolCalls,
            answer,
          };
        } catch (parseError) {
          console.error("❌ 解析 judge_tool 参数失败:", parseError);
          return {
            toolCalls: [],
            answer: "抱歉，我在处理您的请求时遇到了问题",
          };
        }
      }
      return {
        toolCalls: [],
        answer: response.content || "抱歉，我无法回答这个问题",
      };
    } catch (error) {
      console.error("❌ 预请求失败:", error);
      return {
        toolCalls: [],
        answer: "抱歉，系统出现了错误，请稍后再试",
      };
    }
  }
}

export const aiAgentService = new AIAgentService();
