"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  onCreateNote: () => void;
}

/**
 * 空状态组件
 */
export default function EmptyState({ onCreateNote }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        className="text-8xl mb-6"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        📝
      </motion.div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        还没有笔记
      </h3>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        开始记录你的想法、灵感和知识吧
      </p>
      <motion.button
        onClick={onCreateNote}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
      >
        创建第一篇笔记
      </motion.button>
    </motion.div>
  );
}

