"use client";

import { motion, AnimatePresence } from "framer-motion";

interface AssistantMessageProps {
  content: string;
  isStreaming?: boolean;
}

/**
 * AI 助手消息组件
 */
export default function AssistantMessage({
  content,
  isStreaming = false,
}: AssistantMessageProps) {
  return (
    <div className="space-y-2">
      {/* 思考指示器 - 当有内容且正在流式输出时显示 */}
      <AnimatePresence>
        {content && isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-2 px-3"
          >
            {/* 思考气泡动画 */}
            <div className="relative">
              <motion.div
                className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span className="text-white text-xs">🤔</span>
              </motion.div>
              {/* 脉冲圆环 */}
              <motion.div
                className="absolute inset-0 rounded-full bg-blue-400"
                animate={{
                  scale: [1, 1.5, 2],
                  opacity: [0.5, 0.2, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            </div>
            {/* 思考文字 */}
            <motion.span
              className="text-xs text-gray-500 font-medium"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              正在思考
            </motion.span>
            {/* 动态省略号 */}
            <div className="flex space-x-1">
              <motion.span
                className="text-xs text-gray-400"
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0,
                }}
              >
                .
              </motion.span>
              <motion.span
                className="text-xs text-gray-400"
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
              >
                .
              </motion.span>
              <motion.span
                className="text-xs text-gray-400"
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.6,
                }}
              >
                .
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 消息内容 */}
      <div className="bg-gray-100 text-gray-800 rounded-2xl px-4 py-3 transition-all">
        {!content ? (
          // 消息无内容时显示 loading 动画
          <div className="flex items-center space-x-2 py-1">
            <motion.div
              className="w-2 h-2 bg-blue-400 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="w-2 h-2 bg-blue-400 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
            <motion.div
              className="w-2 h-2 bg-blue-400 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
            />
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        )}
      </div>
    </div>
  );
}
