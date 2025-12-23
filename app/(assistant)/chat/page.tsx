"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import WelcomeBanner from "@/app/components/features/WelcomeBanner";
import ChatContainer from "@/app/components/features/ChatContainer";
import MessageInput from "@/app/components/ui/MessageInput";
import { useChatStream } from "@/app/hooks/use-chat-stream";
import type { Message } from "@/app/types";
import { generateId } from "@/app/lib/utils";
import { loadMessages, clearMessages } from "@/app/lib/client";

/**
 * 上下文窗口配置
 * 限制发送给 AI 的历史消息数量，避免上下文过长
 */
const MAX_CONTEXT_MESSAGES = 10; // 最近 10 条消息（约 5 轮对话）

/**
 * 对话页面
 */
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  // 组件挂载时延迟加载历史消息，避免阻塞渲染
  useEffect(() => {
    // 使用 requestIdleCallback 或 setTimeout 延迟加载，避免阻塞首次渲染
    const loadHistoryMessages = async () => {
      try {
        const historyMessages = await loadMessages();
        if (historyMessages.length > 0) {
          setMessages(historyMessages);
        }
      } catch (error) {
        console.error("加载历史消息失败:", error);
        toast.error("加载历史消息失败");
      } finally {
        setIsLoading(false);
      }
    };

    // 延迟加载，让页面先渲染
    const timer = setTimeout(() => {
      loadHistoryMessages();
    }, 0);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 不再需要 useEffect 自动保存，改为在创建/更新时主动保存

  const { stream, isStreaming } = useChatStream({
    onReferences: (refs) => {
      // 接收引用的笔记，更新最后一条 assistant 消息
      console.log("[Chat] 收到引用笔记:", refs);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            references: refs,
          };
          return newMessages;
        }
        return prev;
      });
    },
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
      // 注意：不需要重新加载消息，因为内容和引用都已通过回调实时更新
      console.log("[Chat] 流式响应完成");
    },
    onError: (errorMessage) => {
      // 使用 Toast 显示错误提示
      toast.error(`错误: ${errorMessage}`);
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

      // 如果在欢迎页面，自动切换到聊天页面
      if (showWelcome) {
        setShowWelcome(false);
      }

      // 添加用户消息到前端（服务器会在 API 中保存）
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
      // 限制上下文窗口：只发送最近的消息，避免上下文过长
      const allMessages = [...messages, userMessage];
      const recentMessages = allMessages.slice(-MAX_CONTEXT_MESSAGES);

      console.log(
        `[Chat] 发送消息上下文: 总消息数 ${allMessages.length}, 发送最近 ${recentMessages.length} 条`
      );

      const messageHistory = recentMessages.map((msg) => ({
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
    [messages, stream, isStreaming, showWelcome]
  );

  // 进入聊天列表
  const handleEnterChat = useCallback(() => {
    setShowWelcome(false);
  }, []);

  // 返回欢迎页面
  const handleBackToWelcome = useCallback(() => {
    setShowWelcome(true);
  }, []);

  return (
    <div className="h-full bg-white flex flex-col relative overflow-hidden">
      {/* 背景装饰元素 - 使用 CSS 动画替代 framer-motion 提升性能 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-100 to-blue-100 rounded-full blur-3xl opacity-30 animate-pulse-slower" />
      </div>

      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col min-h-0 relative z-10">
        <AnimatePresence mode="wait">
          {showWelcome ? (
            /* 欢迎页面：标语区域居中显示，输入框固定在底部 */
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
                {/* 如果有历史消息，显示进入聊天列表按钮 */}
                {!isLoading && messages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 flex flex-col items-center gap-4"
                  >
                    <motion.button
                      onClick={handleEnterChat}
                      className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-medium transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 overflow-hidden"
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center gap-3">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>继续未完的对话</span>
                      </div>
                    </motion.button>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-sm text-gray-400"
                    >
                      {messages.length} 段珍贵的记忆等待续写
                    </motion.p>
                  </motion.div>
                )}
              </div>
              {/* 输入框区域 - 只在没有历史消息时显示 */}
              {(isLoading || messages.length === 0) && (
                <div className="flex-shrink-0 px-4 pb-6 pt-4 border-t border-gray-100">
                  <div className="flex flex-col items-center">
                    <MessageInput
                      onSubmit={handleMessageSubmit}
                      disabled={isStreaming}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* 聊天页面：显示聊天容器 */
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
                onBackToWelcome={handleBackToWelcome}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
