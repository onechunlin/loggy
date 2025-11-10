/**
 * Deepseek 服务层
 * 处理与 Deepseek API 的交互（兼容 OpenAI API 格式）
 */

import OpenAI from "openai";
import type { ChatRequestParams } from "@/app/types";

/**
 * 创建 Deepseek 客户端实例
 */
function createDeepseekClient(): OpenAI {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY 环境变量未设置");
  }

  return new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com/v1",
  });
}

/**
 * 流式聊天请求
 * @param params 聊天请求参数
 * @returns 返回一个异步生成器，产生流式响应
 */
export async function* streamChat(
  params: ChatRequestParams
): AsyncGenerator<string, void, unknown> {
  const client = createDeepseekClient();

  // 提取并构建请求参数
  const {
    model = "deepseek-chat",
    messages,
    temperature,
    max_tokens,
    top_p,
    frequency_penalty,
    presence_penalty,
    stream: streamParam,
    ...restParams
  } = params;

  // 确保 stream 参数为 true
  const requestParams = {
    model,
    messages,
    temperature,
    max_tokens,
    top_p,
    frequency_penalty,
    presence_penalty,
    stream: true as const, // 强制启用流式响应，使用 const 断言确保类型正确
    ...restParams, // 透传其他参数（但会覆盖 stream 参数）
  };

  // 确保 stream 参数不会被覆盖
  requestParams.stream = true;

  const stream = await client.chat.completions.create(requestParams);

  // 检查是否是流式响应
  if (!stream || typeof stream[Symbol.asyncIterator] !== "function") {
    throw new Error("Deepseek API 返回的不是流式响应");
  }

  // 处理流式响应
  for await (const chunk of stream) {
    // 检查 chunk 格式
    if (!chunk || !chunk.choices || !Array.isArray(chunk.choices)) {
      continue;
    }

    const choice = chunk.choices[0];
    if (!choice) {
      continue;
    }

    // 获取内容（流式响应中只有 delta.content）
    const content = choice.delta?.content;

    if (content) {
      yield content;
    }

    // 检查是否完成
    if (choice.finish_reason) {
      break;
    }
  }
}

/**
 * 非流式聊天请求（用于工具调用）
 * @param params 聊天请求参数
 * @returns 返回完整的响应对象
 */
export async function chat(
  params: ChatRequestParams & { stream?: boolean }
): Promise<any> {
  const client = createDeepseekClient();

  const {
    model = "deepseek-chat",
    messages,
    temperature,
    max_tokens,
    top_p,
    frequency_penalty,
    presence_penalty,
    stream = false,
    ...restParams
  } = params;

  const requestParams = {
    model,
    messages,
    temperature,
    max_tokens,
    top_p,
    frequency_penalty,
    presence_penalty,
    stream: stream as boolean,
    ...restParams,
  };

  const response = await client.chat.completions.create(requestParams);
  return response;
}
