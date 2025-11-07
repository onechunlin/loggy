"use client";

import { usePathname, useRouter } from "next/navigation";
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
];

/**
 * 侧边栏组件
 */
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (path: string) => {
    router.push(path);
  };

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed sm:relative left-0 top-0 bottom-0 w-16 sm:w-20 bg-white border-r border-gray-100 flex flex-col items-center py-4 sm:py-6 z-50 flex-shrink-0"
    >
      {/* Logo */}
      <motion.div
        className="mb-6 sm:mb-8 text-2xl sm:text-3xl cursor-pointer"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleNavClick("/")}
      >
        ✨
      </motion.div>

      {/* 导航项 */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <motion.button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={`
                relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center
                transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* 图标 */}
              <span className="text-xl sm:text-2xl mb-0.5">{item.icon}</span>

              {/* 标签 */}
              <span className="text-[9px] sm:text-[10px] font-medium">
                {item.label}
              </span>

              {/* 激活指示器 */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r-full"
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
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </nav>
    </motion.aside>
  );
}
