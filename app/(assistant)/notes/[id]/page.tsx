"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { NoteEditor } from "./components";
import {
  getNoteById,
  updateNote,
  deleteNote,
  toggleNoteStar,
} from "@/app/lib/client";
import type { Note } from "@/app/types";
import { formatDateTime } from "@/app/lib/date-utils";

/**
 * 笔记详情页面
 */
export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 使用 ref 跟踪是否正在保存，避免重复保存
  const savingRef = useRef(false);
  // 跟踪上次保存的内容，避免相同内容重复保存
  const lastSavedRef = useRef<string>("");

  // 加载笔记
  useEffect(() => {
    async function loadNote() {
      try {
        const loadedNote = await getNoteById(noteId);
        if (loadedNote) {
          setNote(loadedNote);
          // 初始化上次保存的内容
          lastSavedRef.current = JSON.stringify({
            title: loadedNote.title,
            content: loadedNote.content,
          });
        } else {
          toast.error("笔记不存在");
          router.push("/notes");
        }
      } catch (error) {
        console.error("加载笔记失败:", error);
        toast.error("加载笔记失败");
      } finally {
        setIsLoading(false);
      }
    }

    loadNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  // 防抖保存
  useEffect(() => {
    if (!note || isLoading || savingRef.current) return;

    // 检查内容是否有变化
    const currentContent = JSON.stringify({
      title: note.title,
      content: note.content,
    });

    if (currentContent === lastSavedRef.current) {
      return; // 内容没有变化，不需要保存
    }

    const timer = setTimeout(async () => {
      // 再次检查是否正在保存
      if (savingRef.current) return;

      savingRef.current = true;
      setIsSaving(true);

      try {
        const snapshot = {
          title: note.title,
          content: note.content,
        };

        const updatedNote = await updateNote(noteId, snapshot);
        if (updatedNote) {
          // 更新上次保存的内容
          lastSavedRef.current = JSON.stringify(snapshot);
          // 只更新 updatedAt，不更新其他字段
          setNote((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              updatedAt: updatedNote.updatedAt,
            };
          });
        }
      } catch (error) {
        console.error("保存失败:", error);
        toast.error("保存失败");
      } finally {
        setIsSaving(false);
        savingRef.current = false;
      }
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.title, note?.content, noteId, isLoading]);

  // 切换收藏
  const handleToggleStar = async () => {
    if (!note) return;
    try {
      const updatedNote = await toggleNoteStar(noteId);
      if (updatedNote) {
        setNote(updatedNote);
        toast.success(updatedNote.isStarred ? "已收藏" : "已取消收藏");
      }
    } catch (error) {
      console.error("切换收藏失败:", error);
    }
  };

  // 删除笔记
  const handleDelete = async () => {
    if (!confirm("确定要删除这篇笔记吗？")) return;

    try {
      await deleteNote(noteId);
      toast.success("已删除");
      router.push("/notes");
    } catch (error) {
      console.error("删除失败:", error);
      toast.error("删除失败");
    }
  };

  // 返回列表
  const handleBack = () => {
    router.push("/notes");
  };

  if (isLoading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            📝
          </motion.div>
          <p className="text-gray-400">加载中...</p>
        </motion.div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* 顶部工具栏 */}
      <div className="flex-shrink-0 border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* 左侧：返回按钮 */}
          <div className="flex items-center gap-2 sm:gap-4">
            <motion.button
              onClick={handleBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <span className="text-lg sm:text-base">←</span>
              <span className="text-xs sm:text-sm">返回</span>
            </motion.button>

            {/* 保存状态 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isSaving ? 1 : 0 }}
              className="text-xs sm:text-sm text-gray-400 hidden sm:block"
            >
              保存中...
            </motion.div>
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* 收藏按钮 */}
            <motion.button
              onClick={handleToggleStar}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`text-xl sm:text-2xl ${
                note.isStarred ? "" : "grayscale opacity-40"
              }`}
            >
              ⭐
            </motion.button>

            {/* 删除按钮 */}
            <motion.button
              onClick={handleDelete}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-2 sm:px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all text-xs sm:text-sm"
            >
              删除
            </motion.button>
          </div>
        </div>
      </div>

      {/* 主编辑区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col">
          <NoteEditor
            title={note.title}
            content={note.content}
            onTitleChange={(title) => setNote({ ...note, title })}
            onContentChange={(content) => setNote({ ...note, content })}
          />
        </div>
      </div>

      {/* 底部：元信息 */}
      <div className="flex-shrink-0 border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-400">
            <span>创建于 {formatDateTime(note.createdAt)}</span>
            <span className="hidden sm:inline">·</span>
            <span>更新于 {formatDateTime(note.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
