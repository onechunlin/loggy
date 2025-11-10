"use client";

import Link from "next/link";

interface DemoItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
}

const demos: DemoItem[] = [
  {
    id: "ai-form",
    title: "AI 智能表单",
    description: "基于 antd-mobile 的动态表单组件，支持多种输入类型和自动验证",
    icon: "🤖",
    path: "/demos/ai-form",
  },
];

/**
 * Playground 首页（列表页）
 * 用于放置一些想法的 demo 页面
 */
export default function PlaygroundPage() {
  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎨 Playground</h1>
        <p className="text-gray-600 mb-8">
          这里可以放置一些想法的 demo 页面，用于快速验证和测试。
        </p>

        {/* Demo 列表 */}
        {demos.length === 0 ? (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <p className="text-gray-500 text-sm text-center">
              暂无 demo 页面，快来添加第一个吧！
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {demos.map((demo) => (
              <Link
                key={demo.id}
                href={demo.path}
                className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{demo.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {demo.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {demo.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>查看详情</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
