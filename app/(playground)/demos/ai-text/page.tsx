"use client";

import { FlexText } from "@/app/components/ui";
import { AIAssistantEventCenter, AIAssistantEventName } from "@/app/events";

const AI_COMMANDS: string[] = [
  "将正文调大一点，颜色改为橙色，加粗一点",
  "将标题调到30像素",
  "将描述调小一倍",
  "将描述改为红色",
  "正文改为加粗",
];

/**
 * FlexText 组件演示页面
 */
export default function FlexTextDemoPage() {
  const handleAIAssist = (query: string) => {
    AIAssistantEventCenter.emit(AIAssistantEventName.OpenAssistant, {
      query,
      immediate: !!query,
    });
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📝 AI 文本演示</h1>
          <p className="text-gray-600 mt-2">
            支持通过 AI 助手动态改变字体大小、颜色和字重等
          </p>
        </div>

        {/* 示例文本 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-6 space-y-4">
          <div>
            <FlexText
              content="标题"
              style={{ fontSize: "60px" }}
              className="block"
            />
          </div>
          <div>
            <FlexText content="这是正文内容，吧啦吧啦" />
          </div>
          <div>
            <FlexText
              content="这是一段很小的描述"
              style={{ fontSize: "20px", color: "#999" }}
            />
          </div>
        </div>

        {/* 控制面板 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AI 命令</h2>
          <p className="text-sm text-gray-600 mb-4">
            点击下方命令按钮，将通过 AI 助手执行相应的字体样式调整
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AI_COMMANDS.map((query, index) => (
              <button
                key={index}
                onClick={() => handleAIAssist(query)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-left"
              >
                {query}
              </button>
            ))}
            <button
              onClick={() => handleAIAssist("")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-left"
            >
              自定义输入内容
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
