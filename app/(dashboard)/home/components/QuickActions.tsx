"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface QuickAction {
  id: string;
  icon: string;
  title: string;
  description: string;
  gradient: string;
  path: string;
}

const quickActions: QuickAction[] = [
  {
    id: "chat",
    icon: "💬",
    title: "开始对话",
    description: "与 AI 助手交流",
    gradient: "from-blue-500 to-cyan-500",
    path: "/chat",
  },
  {
    id: "note",
    icon: "📝",
    title: "记录笔记",
    description: "捕捉你的想法",
    gradient: "from-purple-500 to-pink-500",
    path: "/notes",
  },
  {
    id: "todo",
    icon: "✅",
    title: "添加待办",
    description: "管理你的任务",
    gradient: "from-orange-500 to-red-500",
    path: "/todos",
  },
];

/**
 * 快速操作组件
 */
export default function QuickActions() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="mb-8"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ 快速操作</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            onClick={() => router.push(action.path)}
            className="group relative p-6 bg-white rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 overflow-hidden text-left"
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* 渐变背景 */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
            />

            {/* 内容 */}
            <div className="relative z-10">
              <motion.div
                className="text-4xl mb-3"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {action.icon}
              </motion.div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>

            {/* 装饰元素 */}
            <div className="absolute top-4 right-4 text-xl opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

