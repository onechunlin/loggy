"use client";

import { ReactNode, useState, useEffect } from "react";
import TabBar from "./TabBar";
import { AIAssistant } from "@/app/components/features";
import { NavigationConfirmModal } from "@/app/components/ui";
import {
  NavigatePageEventCenter,
  NavigatePageEventName,
  type NavigatePageEventConfig,
} from "@/app/events/navigatePageEvent";
import { findBracketRange } from "@/app/utils/bracket-matcher";

interface MainLayoutProps {
  children: ReactNode;
  showTabBar?: boolean;
}

/**
 * 主布局组件
 * 包含底部导航栏和内容区域
 */
export default function MainLayout({
  children,
  showTabBar = true,
}: MainLayoutProps) {
  const [pendingNavigationUrl, setPendingNavigationUrl] = useState<
    string | null
  >(null);

  // 监听导航事件
  useEffect(() => {
    const handleNavigate = (config: NavigatePageEventConfig) => {
      setPendingNavigationUrl(config.pagePath);
    };

    NavigatePageEventCenter.on(
      NavigatePageEventName.NavigateToPage,
      handleNavigate
    );

    return () => {
      NavigatePageEventCenter.off(NavigatePageEventName.NavigateToPage);
    };
  }, []);

  // 取消跳转
  const handleCancelNavigation = () => {
    console.log("❌ 用户取消跳转");
    setPendingNavigationUrl(null);
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* 主内容区域 - 弹性布局 */}
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>

      {/* 底部导航栏 */}
      {showTabBar && <TabBar />}

      {/* AI 助手 */}
      <AIAssistant />

      {/* 确认跳转弹窗 */}
      {pendingNavigationUrl && (
        <NavigationConfirmModal
          url={pendingNavigationUrl}
          countdownSeconds={3}
          onClose={handleCancelNavigation}
        />
      )}
    </div>
  );
}
