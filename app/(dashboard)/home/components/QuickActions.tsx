"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";

interface QuickAction {
  id: string;
  icon: string;
  title: string;
  description: string;
  gradient: string;
  path: string;
}

const quickActions: QuickAction[] = [
  {
    id: "chat",
    icon: "💬",
    title: "开始对话",
    description: "与 AI 助手交流",
    gradient: "from-blue-500 to-cyan-500",
    path: "/chat",
  },
  {
    id: "note",
    icon: "📝",
    title: "记录笔记",
    description: "捕捉你的想法",
    gradient: "from-purple-500 to-pink-500",
    path: "/notes",
  },
  {
    id: "todo",
    icon: "✅",
    title: "添加待办",
    description: "管理你的任务",
    gradient: "from-orange-500 to-red-500",
    path: "/todos",
  },
];

/**
 * 快速操作组件
 */
function QuickActions() {
  const router = useRouter();

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-3">⚡ 快速操作</h2>
      <div className="grid grid-cols-3 gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => router.push(action.path)}
            className="group relative p-3 bg-white rounded-xl border border-gray-100 hover:border-transparent hover:shadow-lg transition-all duration-300 overflow-hidden text-center active:scale-95"
          >
            {/* 渐变背景 */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
            />

            {/* 内容 */}
            <div className="relative z-10">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {action.icon}
              </div>
              <h3 className="text-xs font-semibold text-gray-900 mb-0.5">
                {action.title}
              </h3>
              <p className="text-[10px] text-gray-500">{action.description}</p>
            </div>

            {/* 装饰元素 */}
            <div className="absolute top-2 right-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(QuickActions);

