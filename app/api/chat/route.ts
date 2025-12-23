import { NextRequest } from "next/server";
import { streamChat, chat, connectDB, authMiddleware } from "@/app/lib/server";
import { Message } from "@/app/lib/server/models";
import type { ChatRequestParams, ReferencedNote } from "@/app/types";
import {
  generateEmbedding,
  searchSimilarNotes,
} from "@/app/lib/server/embedding-service";

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

    // RAG 检索：搜索相关笔记
    let referencedNotes: ReferencedNote[] = [];
    const ragEnabled = process.env.RAG_ENABLED !== "false";
    const similarityThreshold = parseFloat(
      process.env.RAG_SIMILARITY_THRESHOLD || "0.7"
    ); // 相似度阈值，默认 0.7
    const maxResults = parseInt(process.env.RAG_MAX_RESULTS || "5"); // 最多返回结果数

    if (
      ragEnabled &&
      lastUserMessage &&
      lastUserMessage.content.trim().length > 0
    ) {
      try {
        console.log(
          `[RAG] 开始检索相关笔记... (阈值: ${similarityThreshold}, 最多返回: ${maxResults})`
        );
        console.log(`[RAG] 用户问题: ${lastUserMessage.content}`);
        const queryEmbedding = await generateEmbedding(lastUserMessage.content);
        const similarNotes = await searchSimilarNotes(
          queryEmbedding,
          userId,
          maxResults,
          similarityThreshold
        );

        referencedNotes = similarNotes;

        if (referencedNotes.length > 0) {
          console.log(
            `[RAG] 找到 ${referencedNotes.length} 个相关笔记，注入到上下文中`
          );

          // 构建 RAG 上下文
          const ragContext = referencedNotes
            .map((note, index) => {
              const preview =
                note.content.length > 200
                  ? note.content.substring(0, 200) + "..."
                  : note.content;
              return `[笔记 ${index + 1}] 标题: ${
                note.title
              }\n内容: ${preview}`;
            })
            .join("\n\n");

          // 在消息列表开头插入系统消息，包含 RAG 上下文
          const systemMessage = {
            role: "system" as const,
            content: `你是一个智能助手。用户有以下相关笔记可供参考：

${ragContext}

请基于这些笔记内容回答用户的问题。如果笔记中有相关信息，请引用并说明。如果笔记中没有相关信息，请直接回答用户的问题。`,
          };

          // 将系统消息插入到消息列表开头
          body.messages = [systemMessage, ...body.messages];
        }
      } catch (error) {
        console.error("[RAG] 检索相关笔记失败:", error);
        // 失败不影响正常聊天流程
      }
    }

    // 如果 stream 为 false，返回非流式响应（用于工具调用）
    if (body.stream === false) {
      const response = await chat(body);

      // 保存 assistant 消息（包含引用）
      if (response.content) {
        await Message.create({
          userId,
          role: "assistant",
          content: response.content,
          timestamp: new Date(),
          references: referencedNotes.length > 0 ? referencedNotes : undefined,
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
          // 发送初始事件，包含引用的笔记
          controller.enqueue(
            encoder.encode(
              `event: start\ndata: ${JSON.stringify({
                type: "start",
                references: referencedNotes,
              })}\n\n`
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

          // 流式响应完成后，保存 assistant 消息（包含引用）
          if (fullContent && fullContent.trim().length > 0) {
            await Message.create({
              userId,
              role: "assistant",
              content: fullContent,
              timestamp: new Date(),
              references:
                referencedNotes.length > 0 ? referencedNotes : undefined,
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
