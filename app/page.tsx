"use client";

import WelcomeBanner from "@/app/components/features/WelcomeBanner";
import MessageInput from "@/app/components/ui/MessageInput";

export default function Home() {
  const handleMessageSubmit = (message: string) => {
    console.log("发送消息:", message);
    // TODO: 实现消息发送逻辑
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* 标语区域 */}
        <WelcomeBanner />

        {/* 输入框区域 */}
        <MessageInput onSubmit={handleMessageSubmit} />
      </main>
    </div>
  );
}
