"use client";

import { memo, useMemo } from "react";

interface OverviewItem {
  id: string;
  icon: string;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

interface DailyOverviewProps {
  pendingTodos: number;
  totalNotes: number;
  totalMessages: number;
}

/**
 * 今日概览组件
 */
function DailyOverview({
  pendingTodos,
  totalNotes,
  totalMessages,
}: DailyOverviewProps) {
  const overviewItems: OverviewItem[] = useMemo(
    () => [
      {
        id: "todos",
        icon: "✅",
        label: "待办事项",
        value: pendingTodos,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
      {
        id: "notes",
        icon: "📝",
        label: "笔记数量",
        value: totalNotes,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
      {
        id: "messages",
        icon: "💬",
        label: "对话记录",
        value: totalMessages,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
    ],
    [pendingTodos, totalNotes, totalMessages]
  );

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-3">
        📊 今日概览
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {overviewItems.map((item) => (
          <div
            key={item.id}
            className={`${item.bgColor} rounded-xl p-3 border border-transparent hover:border-gray-200 transition-all cursor-pointer`}
          >
            <div className="flex flex-col items-center justify-center mb-2">
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className={`text-xl font-bold ${item.color}`}>
                {item.value}
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium text-center">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(DailyOverview);
