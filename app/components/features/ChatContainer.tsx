"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Message } from "@/app/types";
import MessageInput from "@/app/components/ui/MessageInput";
import AssistantMessage from "@/app/components/features/AssistantMessage";

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
}

/**
 * 消息列表组件
 */
function MessageList({ messages, isStreaming }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 自动滚动到底部
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl space-y-4 mb-6">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => {
          // 判断是否是最后一条消息且为 assistant 消息
          const isLastMessage = index === messages.length - 1;
          const showThinking =
            message.role === "assistant" && isLastMessage && isStreaming;

          return (
            <motion.div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {message.role === "assistant" ? (
                <div className="max-w-[80%]">
                  <AssistantMessage
                    content={message.content}
                    isStreaming={showThinking}
                  />
                </div>
              ) : (
                <div className="max-w-[80%] rounded-2xl px-4 py-3 transition-all bg-blue-500 text-white">
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
}

interface ChatContainerProps {
  onSendMessage: (message: string) => void;
  messages: Message[];
  isStreaming: boolean;
  onBackToWelcome?: () => void;
}

/**
 * 聊天容器组件
 */
export default function ChatContainer({
  onSendMessage,
  messages,
  isStreaming,
  onBackToWelcome,
}: ChatContainerProps) {
  return (
    <div className="flex-1 flex flex-col w-full min-h-0">
      {/* 顶部导航栏 */}
      {onBackToWelcome && (
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <button
              onClick={onBackToWelcome}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="text-sm font-medium">返回首页</span>
            </button>
            <span className="text-sm text-gray-500">
              {messages.length} 条消息
            </span>
          </div>
        </div>
      )}

      {/* 消息列表区域 - 可滚动 */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex flex-col items-center">
          <MessageList messages={messages} isStreaming={isStreaming} />
        </div>
      </div>

      {/* 输入框区域 - 固定在底部 */}
      <div className="flex-shrink-0 px-4 pb-6 pt-4 border-t border-gray-100">
        <div className="flex flex-col items-center">
          <MessageInput onSubmit={onSendMessage} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
}
