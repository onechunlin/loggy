"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WelcomeBanner from "@/app/components/features/WelcomeBanner";
import ChatContainer from "@/app/components/features/ChatContainer";
import MessageInput from "@/app/components/ui/MessageInput";
import { useChatStream } from "@/app/hooks/use-chat-stream";
import { useToast } from "@/app/hooks/use-toast";
import type { Message } from "@/app/types";
import { generateId } from "@/app/lib/utils";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { showToast, ToastComponent } = useToast();

  const { stream, isStreaming, abort } = useChatStream({
    onContent: (fullContent) => {
      // 直接更新最后一条消息的完整内容
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            content: fullContent,
          };
          return newMessages;
        }
        return prev;
      });
    },
    onDone: () => {
      // 流式响应完成
    },
    onError: (errorMessage) => {
      // 使用自定义 Toast 显示错误提示
      showToast(`错误: ${errorMessage}`, 3000);
      // 移除正在生成的消息
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (
          lastMessage &&
          lastMessage.role === "assistant" &&
          !lastMessage.content
        ) {
          newMessages.pop();
        }
        return newMessages;
      });
    },
  });

  const handleMessageSubmit = useCallback(
    async (message: string) => {
      if (!message.trim() || isStreaming) return;

      // 添加用户消息
      const userMessage: Message = {
        id: generateId(),
        content: message,
        timestamp: new Date(),
        role: "user",
      };

      // 添加 AI 回复占位符
      const assistantMessage: Message = {
        id: generateId(),
        content: "",
        timestamp: new Date(),
        role: "assistant",
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      // 构建消息历史（转换为 API 格式）
      const messageHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // 调用流式 API
      try {
        await stream({
          model: "deepseek-chat",
          messages: messageHistory,
          temperature: 0.7,
        });
      } catch (err) {
        // 错误已在 onError 回调中处理
        console.error("发送消息失败:", err);
      }
    },
    [messages, stream, isStreaming]
  );

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-100 to-blue-100 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Toast 提示 */}
      {ToastComponent}

      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col min-h-0 relative z-10">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            /* 没有消息时，标语区域居中显示，输入框固定在底部 */
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="flex-1 flex flex-col items-center justify-center px-4">
                <WelcomeBanner />
              </div>
              {/* 输入框区域 - 固定在底部 */}
              <div className="flex-shrink-0 px-4 pb-6 pt-4 border-t border-gray-100">
                <div className="flex flex-col items-center">
                  <MessageInput
                    onSubmit={handleMessageSubmit}
                    disabled={isStreaming}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            /* 有消息时，显示聊天容器 */
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col min-h-0"
            >
              <ChatContainer
                onSendMessage={handleMessageSubmit}
                messages={messages}
                isStreaming={isStreaming}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
