"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * 主布局组件
 * 包含侧边栏和内容区域
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区域 - 弹性布局 */}
      <main className="flex-1 min-w-0 ml-16 sm:ml-20 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
