"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { Note } from "@/app/types";
import { formatRelativeTime } from "@/app/lib/date-utils";
import { generateSummary, countWords } from "@/app/lib/text-utils";

interface NoteCardProps {
  note: Note;
  index: number;
}

/**
 * 笔记卡片组件
 */
export default function NoteCard({ note, index }: NoteCardProps) {
  const router = useRouter();
  const summary = generateSummary(note.content, 120);
  const wordCount = countWords(note.content);

  const handleClick = () => {
    router.push(`/notes/${note.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={handleClick}
      className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all cursor-pointer"
    >
      {/* 标题和收藏 */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex-1 line-clamp-2">
          {note.title}
        </h3>
        {note.isStarred && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-xl ml-2 flex-shrink-0"
          >
            ⭐
          </motion.span>
        )}
      </div>

      {/* 摘要 */}
      {summary && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{summary}</p>
      )}

      {/* 标签 */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-full">
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* 底部信息 */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{formatRelativeTime(note.updatedAt)}</span>
        <div className="flex items-center gap-3">
          <span>{wordCount} 字</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
            →
          </span>
        </div>
      </div>
    </motion.div>
  );
}

