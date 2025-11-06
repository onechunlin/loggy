"use client";

import { useTyped } from "@/app/hooks/use-typed";
import { motion } from "framer-motion";

/**
 * 欢迎标语组件
 */
export default function WelcomeBanner() {
  const typedRef = useTyped();

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // 自定义缓动函数，更流畅
      }}
    >
      <motion.h1
        className="text-2xl font-medium text-gray-800 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <span ref={typedRef}></span>
      </motion.h1>
      <motion.p
        className="text-gray-500 text-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        智能助手，随时为您提供帮助
      </motion.p>
    </motion.div>
  );
}
