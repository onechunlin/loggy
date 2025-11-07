"use client";

import { motion } from "framer-motion";
import {
  GreetingCard,
  DailyOverview,
  RecentActivity,
  QuickActions,
} from "./home/components";
import { useHomeData } from "./home/hooks/use-home-data";

/**
 * 首页 - 智能控制中心
 */
export default function HomePage() {
  const { pendingTodos, totalNotes, totalMessages, activities, isLoading } =
    useHomeData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
            ✨
          </motion.div>
          <p className="text-gray-400">加载中...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-40"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-100 to-blue-100 rounded-full blur-3xl opacity-40"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* 主内容区域 */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* 问候卡片 */}
        <GreetingCard />

        {/* 今日概览 */}
        <DailyOverview
          pendingTodos={pendingTodos}
          totalNotes={totalNotes}
          totalMessages={totalMessages}
        />

        {/* 快速操作 */}
        <QuickActions />

        {/* 最近活动 */}
        <RecentActivity activities={activities} />
      </main>
    </div>
  );
}

