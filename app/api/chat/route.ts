import { NextRequest } from "next/server";
import { streamChat, chat } from "@/app/lib/server";
import type { ChatRequestParams } from "@/app/types";

/**
 * POST /api/chat
 * SSE 流式聊天接口 或 非流式聊天接口（用于工具调用）
 *
 * 请求体格式：
 * {
 *   model?: string;
 *   messages: Array<{ role: string; content: string }>;
 *   temperature?: number;
 *   ...其他 Deepseek API 参数
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestParams;

    // 验证必需参数
    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: "messages 参数是必需的，且必须是数组" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 如果 stream 为 false，返回非流式响应（用于工具调用）
    if (body.stream === false) {
      const response = await chat(body);
      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 默认使用流式响应
    // 创建 SSE 流
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 发送初始事件
          controller.enqueue(
            encoder.encode(
              `event: start\ndata: ${JSON.stringify({ type: "start" })}\n\n`
            )
          );

          // 流式处理 Deepseek 响应
          for await (const chunk of streamChat(body)) {
            const event = {
              type: "content",
              data: chunk,
            };
            controller.enqueue(
              encoder.encode(
                `event: content\ndata: ${JSON.stringify(event)}\n\n`
              )
            );
          }

          // 发送完成事件
          controller.enqueue(
            encoder.encode(
              `event: done\ndata: ${JSON.stringify({ type: "done" })}\n\n`
            )
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "未知错误";
          const event = {
            type: "error",
            error: errorMessage,
          };
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify(event)}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // 禁用 Nginx 缓冲
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "服务器错误";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
