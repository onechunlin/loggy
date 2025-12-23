"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { ReferencedNote } from "@/app/types";

interface ReferencedNoteCardProps {
  note: ReferencedNote;
  index: number;
}

/**
 * 引用笔记卡片组件
 */
export default function ReferencedNoteCard({
  note,
  index,
}: ReferencedNoteCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/notes/${note.noteId}`);
  };

  // 截取内容预览
  const contentPreview =
    note.content.length > 100
      ? note.content.substring(0, 100) + "..."
      : note.content;

  // 根据相似度计算颜色
  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return "text-green-600 bg-green-50 border-green-200";
    if (similarity >= 0.6) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onClick={handleClick}
      className={`cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md ${getSimilarityColor(
        note.similarity
      )}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold line-clamp-1 flex-1">
          {note.title}
        </h4>
        <div className="flex items-center gap-1 flex-shrink-0">
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-medium">
            {Math.round(note.similarity * 100)}%
          </span>
        </div>
      </div>
      <p className="text-xs opacity-80 line-clamp-2">{contentPreview}</p>
    </motion.div>
  );
}

