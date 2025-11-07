"use client";

import { memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatRelativeTime } from "@/app/lib/date-utils";
import { truncate } from "@/app/lib/text-utils";

interface Activity {
  id: string;
  type: "chat" | "note" | "todo";
  title: string;
  preview?: string;
  timestamp: Date;
  path: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

/**
 * 最近活动组件
 */
function RecentActivity({ activities }: RecentActivityProps) {
  const router = useRouter();

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "chat":
        return "💬";
      case "note":
        return "📝";
      case "todo":
        return "✅";
    }
  };

  const getActivityLabel = (type: Activity["type"]) => {
    switch (type) {
      case "chat":
        return "对话";
      case "note":
        return "笔记";
      case "todo":
        return "待办";
    }
  };

  const displayedActivities = useMemo(
    () => activities.slice(0, 5),
    [activities]
  );

  if (activities.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          🕐 最近活动
        </h2>
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <p className="text-gray-400">暂无活动记录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">🕐 最近活动</h2>
        {activities.length > 5 && (
          <button className="text-sm text-blue-600 hover:text-blue-700">
            查看全部
          </button>
        )}
      </div>
      <div className="space-y-3">
        {displayedActivities.map((activity) => (
          <div
            key={activity.id}
            onClick={() => router.push(activity.path)}
            className="bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer group active:scale-[0.98]"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">
                {getActivityIcon(activity.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">
                    {getActivityLabel(activity.type)}
                  </span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-400">
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {truncate(activity.title, 50)}
                </h3>
                {activity.preview && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {truncate(activity.preview, 80)}
                  </p>
                )}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-gray-400">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(RecentActivity);

