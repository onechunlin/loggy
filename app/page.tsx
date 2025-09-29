"use client";

import { useState, useEffect, useRef } from "react";
import Typed from "typed.js";

export default function Home() {
  const [message, setMessage] = useState("");
  const typedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typedRef.current) {
      const typed = new Typed(typedRef.current, {
        strings: ["欢迎使用 Loggy"],
        typeSpeed: 60,
        showCursor: false,
        autoInsertCss: true,
      });

      return () => {
        typed.destroy();
      };
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.log("发送消息:", message);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* 标语区域 */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-medium text-gray-800 mb-2">
            <span ref={typedRef}></span>
          </h1>
          <p className="text-gray-500 text-sm">智能助手，随时为您提供帮助</p>
        </div>

        {/* 输入框区域 */}
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
              {/* 输入框 */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="输入你今天的问题"
                className="flex-1 px-4 py-4 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-base resize-none min-h-[60px]"
                rows={3}
              />
              {/* 发送按钮 */}
              <button
                type="submit"
                disabled={!message.trim()}
                className="p-3 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="发送消息"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
