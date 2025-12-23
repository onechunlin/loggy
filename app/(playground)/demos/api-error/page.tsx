"use client";

import { useState } from "react";

interface UserInfo {
  profile: {
    name: string;
    age: number;
    email: string;
  };
  settings: {
    theme: string;
    language: string;
  };
}

interface ApiResponse {
  success: boolean;
  message: string;
  userInfo: UserInfo; // 注意：后端这个字段是可选的
  timestamp: string;
}

/**
 * API 协议不对齐演示页面
 *
 * 场景：前端认为 userInfo 是必传字段，但后端是可选的
 * 前端直接使用 userInfo.profile.name 会导致 JavaScript 报错
 */
export default function ApiErrorDemoPage() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const [clearing, setClearing] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/demo/user-info");
      const data: ApiResponse = await res.json();
      setResponse(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm("确定要清空 JS 缓存吗？清空后页面会重新报错。")) {
      return;
    }

    setClearing(true);
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.active) {
          // 发送清除缓存消息
          registration.active.postMessage({
            type: "CLEAR_ALL_JS_CONTENT",
            data: {},
          });

          // 监听清除成功的消息
          let timeoutId: NodeJS.Timeout | null = null;
          const messageHandler = (event: MessageEvent) => {
            const { type } = event.data as { type: string };
            if (
              type === "CLEAR_ALL_JS_CONTENT_SUCCESS" ||
              type === "CLEAR_ALL_JS_CONTENT_ERROR"
            ) {
              if (timeoutId) {
                clearTimeout(timeoutId);
              }
              navigator.serviceWorker.removeEventListener(
                "message",
                messageHandler
              );

              if (type === "CLEAR_ALL_JS_CONTENT_SUCCESS") {
                alert("JS 缓存已清空，页面将重新加载");
                window.location.reload();
              } else {
                alert("清空缓存失败，请重试");
                setClearing(false);
              }
            }
          };

          navigator.serviceWorker.addEventListener("message", messageHandler);

          // 设置超时
          timeoutId = setTimeout(() => {
            navigator.serviceWorker.removeEventListener(
              "message",
              messageHandler
            );
            alert("清空缓存超时，请重试");
            setClearing(false);
          }, 5000);
        } else {
          alert("Service Worker 未激活");
          setClearing(false);
        }
      } else {
        alert("浏览器不支持 Service Worker");
        setClearing(false);
      }
    } catch (error) {
      console.error("清空缓存失败:", error);
      alert("清空缓存失败，请重试");
      setClearing(false);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ⚠️ API 协议不对齐演示
          </h1>
          <p className="text-gray-600 mt-2">
            演示前端和后端接口协议不对齐导致的 JavaScript 错误
          </p>
        </div>

        {/* 说明卡片 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">
            📋 问题说明
          </h2>
          <ul className="text-sm text-yellow-800 space-y-2 list-disc list-inside">
            <li>
              前端认为{" "}
              <code className="bg-yellow-100 px-1 rounded">userInfo</code>{" "}
              字段是必传的
            </li>
            <li>
              后端实际返回中{" "}
              <code className="bg-yellow-100 px-1 rounded">userInfo</code>{" "}
              是可选的 （90% 概率不返回）
            </li>
            <li>
              前端直接使用{" "}
              <code className="bg-yellow-100 px-1 rounded">
                data.userInfo.profile.name
              </code>{" "}
              访问，当后端没有返回{" "}
              <code className="bg-yellow-100 px-1 rounded">userInfo</code>{" "}
              时，会页面白屏
            </li>
            <li>前端监测到页面白屏后，会后台调用 AI 修复页面异常</li>
            <li>AI 修复完成后，会重新加载页面</li>
          </ul>
        </div>

        {/* 操作按钮 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-6 space-y-3">
          <button
            onClick={handleRequest}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? "请求中..." : "发起请求（可能触发错误）"}
          </button>
          <button
            onClick={handleClearCache}
            disabled={clearing}
            className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {clearing ? "清空中..." : "清空JS缓存（会重新报错）"}
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <h6 className="text-lg font-semibold text-gray-900 mb-2">
            用户名称：{response?.userInfo.profile.name}
          </h6>
        </div>
      </div>
    </div>
  );
}
