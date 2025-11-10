"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Todo } from "@/app/types";
import { parseTodoText } from "@/app/lib/text-utils";

interface TodoFormProps {
  editingTodo?: Todo | null;
  onSubmit: (data: {
    title: string;
    description?: string;
    dueDate?: Date;
    tags: string[];
  }) => void;
  onCancel: () => void;
}

/**
 * 待办表单组件
 */
export default function TodoForm({
  editingTodo,
  onSubmit,
  onCancel,
}: TodoFormProps) {
  const [title, setTitle] = useState(editingTodo?.title || "");
  const [description, setDescription] = useState(
    editingTodo?.description || ""
  );
  const [dueDate, setDueDate] = useState(
    editingTodo?.dueDate
      ? new Date(editingTodo.dueDate).toISOString().split("T")[0]
      : ""
  );
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(editingTodo?.tags || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags,
    });

    // 清空表单
    setTitle("");
    setDescription("");
    setDueDate("");
    setTags([]);
    setTagInput("");
  };

  const handleQuickAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      // Ctrl+Enter 快速添加
      const parsed = parseTodoText(title);
      onSubmit({
        title: parsed.title,
        dueDate: parsed.dueDate,
        tags: parsed.tags,
      });
      setTitle("");
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg mb-4 sm:mb-6"
    >
      {/* 标题输入 */}
      <div className="mb-3 sm:mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleQuickAdd}
          placeholder="添加待办事项..."
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
        <p className="mt-2 text-xs text-gray-400">
          💡 可输入&ldquo;明天下午2点开会 #工作&rdquo;自动识别
        </p>
      </div>

      {/* 描述输入 */}
      <div className="mb-3 sm:mb-4">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="添加描述（可选）"
          rows={3}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* 日期和标签 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
        {/* 截止日期 */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            截止日期
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 标签输入 */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            标签
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              placeholder="添加标签"
              className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-sm sm:text-base"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 标签列表 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <AnimatePresence>
            {tags.map((tag) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 按钮 */}
      <div className="flex gap-2 sm:gap-3">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!title.trim()}
          className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {editingTodo ? "更新" : "添加"}
        </motion.button>
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
        >
          取消
        </motion.button>
      </div>
    </motion.form>
  );
}

