"use client";

import { useCallback, useRef, useState } from "react";
import { getAuthToken } from "@/app/lib/client";
import type { ChatRequestParams, SSEEvent } from "@/app/types";

interface UseChatStreamOptions {
  onContent?: (content: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

interface UseChatStreamReturn {
  stream: (params: ChatRequestParams) => Promise<void>;
  isStreaming: boolean;
  abort: () => void;
}

/**
 * SSE 流式聊天 Hook
 *
 * @example
 * ```tsx
 * const { stream, isStreaming, abort } = useChatStream({
 *   onContent: (content) => console.log(content),
 *   onDone: () => console.log('完成'),
 *   onError: (error) => console.error(error),
 * });
 *
 * await stream({
 *   messages: [{ role: 'user', content: '你好' }],
 * });
 * ```
 */
export function useChatStream(
  options: UseChatStreamOptions = {}
): UseChatStreamReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    async (params: ChatRequestParams) => {
      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 创建新的 AbortController
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsStreaming(true);

      // 维护完整的消息内容
      let fullContent = "";

      try {
        // 获取认证 token
        const token = getAuthToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch("/api/chat", {
          method: "POST",
          headers,
          body: JSON.stringify(params),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "请求失败");
        }

        if (!response.body) {
          throw new Error("响应体为空");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() || "";

          for (const chunk of chunks) {
            if (!chunk.trim()) continue;

            const lines = chunk.split("\n");
            let eventType = "";
            let eventData = "";

            for (const line of lines) {
              if (line.startsWith("event: ")) {
                eventType = line.replace("event: ", "").trim();
              } else if (line.startsWith("data: ")) {
                eventData = line.replace("data: ", "");
              }
            }

            if (eventType && eventData) {
              try {
                const event: SSEEvent = JSON.parse(eventData);

                switch (eventType) {
                  case "content":
                    if (event.data) {
                      // 追加到完整内容
                      fullContent += event.data;
                      // 传递完整的消息内容
                      if (options.onContent) {
                        options.onContent(fullContent);
                      }
                    }
                    break;
                  case "done":
                    if (options.onDone) {
                      options.onDone();
                    }
                    setIsStreaming(false);
                    return;
                  case "error":
                    if (event.error && options.onError) {
                      options.onError(event.error);
                    }
                    setIsStreaming(false);
                    return;
                }
              } catch (parseError) {
                console.error("解析 SSE 事件失败:", parseError);
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // 请求被取消，不处理错误
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : "未知错误";
        if (options.onError) {
          options.onError(errorMessage);
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [options]
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  return {
    stream,
    isStreaming,
    abort,
  };
}
