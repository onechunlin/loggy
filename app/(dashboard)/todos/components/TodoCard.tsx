"use client";

import { motion } from "framer-motion";
import type { Todo } from "@/app/types";
import { formatRelativeTime } from "@/app/lib/date-utils";

interface TodoCardProps {
  todo: Todo;
  index: number;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

/**
 * 待办卡片组件
 */
export default function TodoCard({
  todo,
  index,
  onToggle,
  onEdit,
  onDelete,
}: TodoCardProps) {
  const isOverdue =
    todo.dueDate &&
    !todo.completed &&
    new Date(todo.dueDate) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`group bg-white rounded-xl p-4 border transition-all ${
        todo.completed
          ? "border-gray-200 opacity-60"
          : isOverdue
          ? "border-red-200 bg-red-50/30"
          : "border-gray-100 hover:border-blue-200 hover:shadow-lg"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* 复选框 */}
        <motion.button
          onClick={() => onToggle(todo.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            todo.completed
              ? "bg-green-500 border-green-500"
              : "border-gray-300 hover:border-blue-500"
          }`}
        >
          {todo.completed && <span className="text-white text-sm">✓</span>}
        </motion.button>

        {/* 内容区 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              onClick={() => !todo.completed && onEdit(todo)}
              className={`text-base font-medium cursor-pointer transition-colors ${
                todo.completed
                  ? "text-gray-400 line-through"
                  : "text-gray-900 hover:text-blue-600"
              }`}
            >
              {todo.title}
            </h3>
            {isOverdue && (
              <span className="flex-shrink-0 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                逾期
              </span>
            )}
          </div>

          {/* 描述 */}
          {todo.description && (
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
              {todo.description}
            </p>
          )}

          {/* 底部信息 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {todo.dueDate && (
                <span
                  className={isOverdue && !todo.completed ? "text-red-500" : ""}
                >
                  📅 {formatRelativeTime(todo.dueDate)}
                </span>
              )}
              {todo.tags.length > 0 && (
                <div className="flex gap-1">
                  {todo.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                  {todo.tags.length > 2 && (
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full">
                      +{todo.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 删除按钮 */}
            <button
              onClick={() => onDelete(todo.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-sm"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

