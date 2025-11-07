"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { NoteCard, EmptyState, SearchBar } from "./components";
import { getAllNotes, createNote } from "@/app/services/note-storage";
import type { Note } from "@/app/types";

/**
 * 笔记列表页面
 */
export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStarred, setFilterStarred] = useState(false);

  // 加载笔记
  useEffect(() => {
    async function loadNotes() {
      try {
        const allNotes = await getAllNotes();
        setNotes(allNotes);
      } catch (error) {
        console.error("加载笔记失败:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadNotes();
  }, []);

  // 筛选笔记
  const filteredNotes = useMemo(() => {
    let result = notes;

    // 收藏筛选
    if (filterStarred) {
      result = result.filter((note) => note.isStarred);
    }

    // 搜索筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [notes, searchQuery, filterStarred]);

  // 创建新笔记
  const handleCreateNote = async () => {
    try {
      const newNote = await createNote({
        title: "无标题笔记",
        content: "",
      });
      router.push(`/notes/${newNote.id}`);
    } catch (error) {
      console.error("创建笔记失败:", error);
    }
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-50 to-purple-50/30 flex items-center justify-center">
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

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-purple-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* 头部 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                📝 我的笔记
              </h1>
              <p className="text-sm sm:text-base text-gray-500">
                共 {notes.length} 篇笔记
                {filterStarred && ` · 已收藏 ${filteredNotes.length} 篇`}
              </p>
            </div>
            <motion.button
              onClick={handleCreateNote}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <span className="text-lg sm:text-xl">+</span>
              <span>新建笔记</span>
            </motion.button>
          </div>

          {/* 搜索和筛选 */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <SearchBar
                onSearch={setSearchQuery}
                placeholder="搜索笔记..."
              />
            </div>
            <motion.button
              onClick={() => setFilterStarred(!filterStarred)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2.5 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                filterStarred
                  ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-300"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {filterStarred ? "⭐ 已收藏" : "⭐ 收藏"}
            </motion.button>
          </div>
        </div>

        {/* 笔记列表 */}
        {filteredNotes.length === 0 ? (
          searchQuery || filterStarred ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 sm:py-16"
            >
              <p className="text-gray-400 text-base sm:text-lg px-4">
                {searchQuery
                  ? `没有找到包含 "${searchQuery}" 的笔记`
                  : "暂无收藏的笔记"}
              </p>
            </motion.div>
          ) : (
            <EmptyState onCreateNote={handleCreateNote} />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredNotes.map((note, index) => (
              <NoteCard key={note.id} note={note} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

