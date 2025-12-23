import { NextRequest } from "next/server";
import { streamChat, chat, connectDB, authMiddleware } from "@/app/lib/server";
import { Message } from "@/app/lib/server/models";
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
    // 验证认证
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return new Response(
        JSON.stringify({ error: authResult.error || "认证失败" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const userId = authResult.userId!;
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

    // 连接数据库
    await connectDB();

    // 获取最后一条用户消息（最新发送的）
    const lastUserMessage = body.messages
      .filter((msg) => msg.role === "user")
      .pop();

    // 保存用户消息到数据库
    let userMessageDoc = null;
    if (lastUserMessage && lastUserMessage.content) {
      userMessageDoc = await Message.create({
        userId,
        role: "user",
        content: lastUserMessage.content,
        timestamp: new Date(),
      });
    }

    // 如果 stream 为 false，返回非流式响应（用于工具调用）
    if (body.stream === false) {
      const response = await chat(body);

      // 保存 assistant 消息
      if (response.content) {
        await Message.create({
          userId,
          role: "assistant",
          content: response.content,
          timestamp: new Date(),
        });
      }

      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 默认使用流式响应
    // 创建 SSE 流
    const encoder = new TextEncoder();
    let fullContent = "";

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
            fullContent += chunk;

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

          // 流式响应完成后，保存 assistant 消息
          if (fullContent && fullContent.trim().length > 0) {
            await Message.create({
              userId,
              role: "assistant",
              content: fullContent,
              timestamp: new Date(),
            });
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
