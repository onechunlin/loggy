"use client";

import { useState, useEffect } from "react";
import { loadMessages } from "@/app/lib/client";
import { getAllNotes } from "@/app/lib/client";
import { getAllTodos } from "@/app/lib/client";
import { extractPlainText } from "@/app/lib/text-utils";

interface Activity {
  id: string;
  type: "chat" | "note" | "todo";
  title: string;
  preview?: string;
  timestamp: Date;
  path: string;
}

interface HomeData {
  pendingTodos: number;
  totalNotes: number;
  totalMessages: number;
  activities: Activity[];
  isLoading: boolean;
}

/**
 * 首页数据聚合 Hook
 */
export function useHomeData(): HomeData {
  const [data, setData] = useState<HomeData>({
    pendingTodos: 0,
    totalNotes: 0,
    totalMessages: 0,
    activities: [],
    isLoading: true,
  });

  useEffect(() => {
    async function loadData() {
      try {
        // 并行加载所有数据
        const [messages, notes, todos] = await Promise.all([
          loadMessages(),
          getAllNotes(),
          getAllTodos(),
        ]);

        // 统计数据
        const pendingTodos = todos.filter((t) => !t.completed).length;
        const totalNotes = notes.length;
        const totalMessages = messages.length;

        // 生成活动列表
        const activities: Activity[] = [];

        // 添加最近的聊天记录
        if (messages.length > 0) {
          const lastUserMessage = messages
            .filter((m) => m.role === "user")
            .slice(-1)[0];
          if (lastUserMessage) {
            activities.push({
              id: `chat-${lastUserMessage.id}`,
              type: "chat",
              title: lastUserMessage.content,
              preview: undefined,
              timestamp: lastUserMessage.timestamp,
              path: "/chat",
            });
          }
        }

        // 添加最近的笔记
        notes
          .slice(0, 3)
          .forEach((note) => {
            activities.push({
              id: `note-${note.id}`,
              type: "note",
              title: note.title,
              preview: extractPlainText(note.content),
              timestamp: note.updatedAt,
              path: `/notes/${note.id}`,
            });
          });

        // 添加最近的待办
        todos
          .slice(0, 2)
          .forEach((todo) => {
            activities.push({
              id: `todo-${todo.id}`,
              type: "todo",
              title: todo.title,
              preview: todo.description,
              timestamp: todo.updatedAt,
              path: "/todos",
            });
          });

        // 按时间排序
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setData({
          pendingTodos,
          totalNotes,
          totalMessages,
          activities: activities.slice(0, 5),
          isLoading: false,
        });
      } catch (error) {
        console.error("加载首页数据失败:", error);
        setData((prev) => ({ ...prev, isLoading: false }));
      }
    }

    loadData();
  }, []);

  return data;
}

