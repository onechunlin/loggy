"use client";

import { motion } from "framer-motion";

interface OverviewItem {
  id: string;
  icon: string;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

interface DailyOverviewProps {
  pendingTodos: number;
  totalNotes: number;
  totalMessages: number;
}

/**
 * 今日概览组件
 */
export default function DailyOverview({
  pendingTodos,
  totalNotes,
  totalMessages,
}: DailyOverviewProps) {
  const overviewItems: OverviewItem[] = [
    {
      id: "todos",
      icon: "✅",
      label: "待办事项",
      value: pendingTodos,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      id: "notes",
      icon: "📝",
      label: "笔记数量",
      value: totalNotes,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: "messages",
      icon: "💬",
      label: "对话记录",
      value: totalMessages,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-8"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 今日概览</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {overviewItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`${item.bgColor} rounded-2xl p-6 border border-transparent hover:border-gray-200 transition-all cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{item.icon}</span>
              <motion.span
                className={`text-3xl font-bold ${item.color}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
              >
                {item.value}
              </motion.span>
            </div>
            <p className="text-sm text-gray-600 font-medium">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

