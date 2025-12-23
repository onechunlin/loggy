"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import MainLayout from "./MainLayout";

interface SecondaryLayoutProps {
  children: ReactNode;
  /** 返回按钮要跳转的路径，默认返回上一页 */
  backPath?: string;
  /** 返回按钮文本，默认"返回" */
  backText?: string;
}

/**
 * 二级页面布局组件
 * 包含顶部导航栏和返回按钮
 */
export default function SecondaryLayout({
  children,
  backPath,
  backText = "返回",
}: SecondaryLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backPath) {
      router.push(backPath);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors active:scale-95"
          >
            <span className="text-lg">←</span>
            <span className="text-sm font-medium">{backText}</span>
          </button>
        </div>
      </nav>
      <MainLayout showTabBar={false}>{children}</MainLayout>
    </div>
  );
}
