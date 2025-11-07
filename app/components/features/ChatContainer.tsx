"use client";

import { useEffect, useRef, memo, useMemo } from "react";
import type { Message } from "@/app/types";
import MessageInput from "@/app/components/ui/MessageInput";
import AssistantMessage from "@/app/components/features/AssistantMessage";

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
}

/**
 * 单条消息组件
 */
const MessageItem = memo(
  ({
    message,
    isStreaming,
    isLastMessage,
  }: {
    message: Message;
    isStreaming: boolean;
    isLastMessage: boolean;
  }) => {
    const showThinking =
      message.role === "assistant" && isLastMessage && isStreaming;

    return (
      <div
        className={`flex ${
          message.role === "user" ? "justify-end" : "justify-start"
        }`}
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
      </div>
    );
  }
);

MessageItem.displayName = "MessageItem";

/**
 * 消息列表组件
 */
const MessageList = memo(({ messages, isStreaming }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  useEffect(() => {
    // 只在消息数量增加时滚动，避免频繁滚动
    if (messages.length > prevMessagesLengthRef.current) {
      // 使用 requestAnimationFrame 延迟滚动，避免阻塞渲染
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  const messageItems = useMemo(() => {
    return messages.map((message, index) => {
      const isLastMessage = index === messages.length - 1;
      return (
        <MessageItem
          key={message.id}
          message={message}
          isStreaming={isStreaming}
          isLastMessage={isLastMessage}
        />
      );
    });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl space-y-4 mb-6">
      {messageItems}
      <div ref={messagesEndRef} />
    </div>
  );
});

MessageList.displayName = "MessageList";

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
