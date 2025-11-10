"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

/**
 * 导航项配置
 */
interface NavItem {
  id: string;
  icon: string;
  label: string;
  path: string;
  badge?: number; // 可选的徽章数字
}

const navItems: NavItem[] = [
  {
    id: "home",
    icon: "🏠",
    label: "首页",
    path: "/",
  },
  {
    id: "chat",
    icon: "💬",
    label: "对话",
    path: "/chat",
  },
  {
    id: "notes",
    icon: "📝",
    label: "笔记",
    path: "/notes",
  },
  {
    id: "todos",
    icon: "✅",
    label: "待办",
    path: "/todos",
  },
  {
    id: "playground",
    icon: "🎨",
    label: "实验",
    path: "/playground",
  },
];

/**
 * 底部导航栏组件
 */
export default function TabBar() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-20 sm:h-24 bg-white border-t border-gray-100 flex items-center justify-around px-2 sm:px-4 shadow-lg"
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        minHeight: "5rem",
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.path;

        return (
          <motion.div
            key={item.id}
            className="flex-1 max-w-[120px] h-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={item.path}
              className={`
                relative w-full h-full flex flex-col items-center justify-center gap-1
                transition-all duration-200
                ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }
              `}
            >
              {/* 图标 */}
              <span className="text-2xl sm:text-3xl">{item.icon}</span>

              {/* 标签 */}
              <span className="text-xs sm:text-sm font-medium">
                {item.label}
              </span>

              {/* 激活指示器 */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-blue-600 rounded-b-full"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}

              {/* 徽章（如果有） */}
              {item.badge && item.badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1/4 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </motion.span>
              )}
            </Link>
          </motion.div>
        );
      })}
    </motion.nav>
  );
}
