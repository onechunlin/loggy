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

    if ("serviceWorker" in navigator) {
      window.addEventListener("error", (event) => {
        const errorFileName = event.filename;
        const errorLineNumber = event.lineno;
        const errorColumnNumber = event.colno;
        const errorMessage = event.message;
        console.error("global error", {
          errorFileName,
          errorLineNumber,
          errorColumnNumber,
          errorMessage,
        });

        navigator.serviceWorker.getRegistration().then((registration) => {
          // 向激活的 Service Worker 发送消息
          if (registration?.active) {
            // 发送消息
            registration.active.postMessage({
              type: "REPLACE_JS_CONTENT",
              data: {
                fileName: errorFileName,
                lineNumber: errorLineNumber,
                columnNumber: errorColumnNumber,
                message: errorMessage,
              },
            });
          }
        });
      });

      // 监听 Service Worker 的回复
      navigator.serviceWorker.addEventListener("message", (event) => {
        const { type, data } = event.data as {
          type: string;
          data: { fileName: string };
        };
        if (type === "REPLACE_JS_CONTENT_START") {
          alert("监测到页面异常，AI正在尝试修复");
          console.warn("⚠️监测到页面异常，AI正在尝试修复");
        } else if (type === "REPLACE_JS_CONTENT_SUCCESS") {
          confirm("AI已尝试修复完成，点击重新加载");
          window.location.reload();
        }
      });
    }

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
