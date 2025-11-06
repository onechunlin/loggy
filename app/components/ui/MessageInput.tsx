"use client";

import { useState } from "react";

interface MessageInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
}

/**
 * 消息输入组件
 */
export default function MessageInput({
  onSubmit,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSubmit(message.trim());
      setMessage("");
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
          {/* 输入框 */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={disabled ? "AI 正在回复..." : "输入你今天的问题"}
            disabled={disabled}
            className="flex-1 px-4 py-4 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-base resize-none min-h-[60px] disabled:opacity-50 disabled:cursor-not-allowed"
            rows={3}
          />
          {/* 发送按钮 */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="p-3 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="发送消息"
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
