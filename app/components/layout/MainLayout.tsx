"use client";

import { ReactNode } from "react";
import TabBar from "./TabBar";

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * 主布局组件
 * 包含底部导航栏和内容区域
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* 主内容区域 - 弹性布局 */}
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>

      {/* 底部导航栏 */}
      <TabBar />
    </div>
  );
}
