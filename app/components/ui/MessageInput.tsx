"use client";

import { useState } from "react";
import { motion } from "framer-motion";

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
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSubmit(message.trim());
      setMessage("");
    }
  };

  return (
    <motion.div
      className="w-full max-w-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          className="flex items-center bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200"
          animate={{
            scale: isFocused ? 1.02 : 1,
            boxShadow: isFocused
              ? "0 8px 30px rgba(59, 130, 246, 0.12)"
              : "0 0 0 rgba(0, 0, 0, 0)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* 输入框 */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={disabled ? "AI 正在回复..." : "输入你今天的问题"}
            disabled={disabled}
            className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-base resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
          />
          {/* 发送按钮 */}
          <motion.button
            type="submit"
            disabled={!message.trim() || disabled}
            className="p-3 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="发送消息"
            whileHover={{ scale: message.trim() && !disabled ? 1.1 : 1 }}
            whileTap={{ scale: message.trim() && !disabled ? 0.95 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <motion.svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{
                rotate: message.trim() && !disabled ? [0, 5, -5, 0] : 0,
              }}
              transition={{
                duration: 0.5,
                repeat: message.trim() && !disabled ? Infinity : 0,
                repeatDelay: 2,
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </motion.svg>
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}
