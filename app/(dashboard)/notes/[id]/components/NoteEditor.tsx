"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface NoteEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
}

/**
 * 笔记编辑器组件
 */
export default function NoteEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
}: NoteEditorProps) {
  const [wordCount, setWordCount] = useState(0);

  // 统计字数
  useEffect(() => {
    const text = (title + content).replace(/\s/g, "");
    setWordCount(text.length);
  }, [title, content]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* 标题输入 */}
      <div className="px-4 sm:px-8 pt-4 sm:pt-8 pb-3 sm:pb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="无标题笔记"
          className="w-full text-2xl sm:text-4xl font-bold text-gray-900 bg-transparent border-none outline-none placeholder-gray-300"
        />
      </div>

      {/* 内容编辑区 */}
      <div className="flex-1 px-4 sm:px-8 pb-4 sm:pb-8 overflow-hidden">
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="开始写点什么..."
          className="w-full h-full text-sm sm:text-base text-gray-700 bg-transparent border-none outline-none resize-none placeholder-gray-300 leading-relaxed"
        />
      </div>

      {/* 底部状态栏 */}
      <div className="px-4 sm:px-8 py-3 sm:py-4 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm text-gray-500">
        <div>
          <span className="hidden sm:inline">Markdown 格式支持</span>
          <span className="sm:hidden">Markdown</span>
        </div>
        <div>
          <span>{wordCount} 字</span>
        </div>
      </div>
    </div>
  );
}
