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
}

/**
 * 聊天容器组件
 */
export default function ChatContainer({
  onSendMessage,
  messages,
  isStreaming,
}: ChatContainerProps) {
  return (
    <div className="flex-1 flex flex-col w-full min-h-0">
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
