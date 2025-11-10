"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface NavigationConfirmModalProps {
  url: string;
  countdownSeconds?: number;
  onClose: () => void;
}

/**
 * 导航确认弹窗组件
 */
export default function NavigationConfirmModal({
  url,
  countdownSeconds = 3,
  onClose,
}: NavigationConfirmModalProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [countdownTimer, setCountdownTimer] = useState<NodeJS.Timeout | null>(
    null,
  );

  // 启动倒计时
  useEffect(() => {
    setCountdown(countdownSeconds);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        const newCountdown = prev - 1;
        if (newCountdown <= 0) {
          // 倒计时结束，清除定时器
          clearInterval(timer);
          return 0;
        }
        return newCountdown;
      });
    }, 1000);

    setCountdownTimer(timer);

    return () => {
      clearInterval(timer);
    };
  }, [url, countdownSeconds]);

  // 当倒计时为 0 时，执行导航
  useEffect(() => {
    if (countdown === 0) {
      // 使用 setTimeout 确保不在渲染过程中执行
      const timeoutId = setTimeout(() => {
        router.push(url);
        onClose();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [countdown, url, router, onClose]);

  // 取消跳转
  const handleCancel = () => {
    console.log("❌ 用户取消跳转");
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }
    onClose();
  };

  // 立即跳转
  const handleConfirm = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }
    router.push(url);
    onClose();
  };

  // 获取页面名称
  const getPageName = (url: string): string => {
    const path = url.split("?")[0];
    const pageNames: Record<string, string> = {
      "/": "首页",
      "/notes": "笔记列表",
      "/todos": "待办列表",
      "/chat": "AI对话",
      "/playground": "演示页面",
    };
    return pageNames[path] || "该页面";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-lg font-semibold mb-4">确认跳转</h3>
        <p className="text-gray-700 mb-4">
          即将跳转到 <strong>{getPageName(url)}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          {countdown > 0 ? `${countdown} 秒后自动跳转` : "正在跳转..."}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            立即跳转
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

