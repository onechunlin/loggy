"use client";

import { motion } from "framer-motion";
import { getTimeGreeting, getWeekday } from "@/app/lib/date-utils";

/**
 * 问候卡片组件
 */
export default function GreetingCard() {
  const now = new Date();
  const greeting = getTimeGreeting();
  const weekday = getWeekday(now);
  const date = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        {greeting} 👋
      </h1>
      <p className="text-gray-500">
        {date} {weekday}
      </p>
    </motion.div>
  );
}

