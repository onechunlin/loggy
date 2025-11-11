"use client";

import { useState, useEffect, useCallback } from "react";
import { CommandCenter, CommandResult } from "@/app/utils/commandCenter";
import {
  NavigateCommand,
  ChangeFontSizeCommand,
  ChangeFontColorCommand,
  generateFormCommands,
} from "@/app/utils/commandCenter/commands";
import { aiAgentService, AgentResponse } from "@/app/lib/client";

type ToolExecutionStatus = {
  toolName: string;
  displayName: string;
  status: "pending" | "executing" | "completed";
};

/**
 * AI 助手组件
 */
export default function AIAssistant() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toolExecutions, setToolExecutions] = useState<ToolExecutionStatus[]>(
    []
  );
  const [aiReplyContent, setAiReplyContent] = useState("");

  // 组件挂载时注册所有指令
  useEffect(() => {
    console.log("🎯 AIAssistant 初始化，注册指令到指令中心");

    // 注册基础指令
    CommandCenter.registerBatch([
      new NavigateCommand(),
      new ChangeFontSizeCommand(),
      new ChangeFontColorCommand(),
    ]);

    // 注册表单指令（动态生成）
    CommandCenter.registerBatch(generateFormCommands());

    console.log(
      `✅ 已注册 ${CommandCenter.size} 个指令:`,
      CommandCenter.getCommandNames()
    );

    // 组件卸载时清理
    return () => {
      console.log("🧹 组件卸载，清空指令中心");
      CommandCenter.clear();
    };
  }, []);

  // 工具名称映射
  const getToolDisplayName = useCallback((toolName: string): string => {
    const nameMap: Record<string, string> = {
      navigate_to_page: "页面跳转",
      change_font_size: "调整字体大小",
      change_font_color: "调整字体颜色",
    };

    if (toolName.startsWith("change_form_values")) {
      const formId = toolName.split("-")[1];
      return `填写表单(${formId})`;
    }

    return nameMap[toolName] || toolName;
  }, []);

  // 点击 AI 图标，弹出弹窗
  const handleIconClick = useCallback(() => {
    setIsModalVisible(true);
    setQuery("");
    setIsAnalyzing(false);
    setToolExecutions([]);
    setAiReplyContent("");
  }, []);

  // 关闭弹窗
  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setQuery("");
    setToolExecutions([]);
    setAiReplyContent("");
  }, []);

  // 处理工具调用
  const handleToolCall = useCallback(
    async (response: AgentResponse) => {
      if (!response.toolCalls || response.toolCalls.length === 0) {
        return null;
      }

      const toolCalls = response.toolCalls;
      console.log(`🔧 需要调用 ${toolCalls.length} 个工具`);

      // 初始化所有工具为 pending 状态
      const initialToolExecutions: ToolExecutionStatus[] = toolCalls.map(
        (toolCall) => ({
          toolName: toolCall.function.name,
          displayName: getToolDisplayName(toolCall.function.name),
          status: "pending" as const,
        })
      );

      setToolExecutions(initialToolExecutions);

      // 延迟一下让用户看到工具列表，然后关闭弹窗
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 关闭弹窗，但保留工具执行状态
      setIsModalVisible(false);
      setQuery("");

      // 依次执行每个工具（通过指令中心）
      const commandResults: CommandResult[] = [];
      for (let index = 0; index < toolCalls.length; index++) {
        const toolCall = toolCalls[index];
        console.log(
          `📝 工具 ${index + 1}/${toolCalls.length}:`,
          toolCall.function.name
        );

        // 更新为执行中状态
        setToolExecutions((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, status: "executing" as const } : item
          )
        );

        // 延迟一下让用户看到执行状态
        await new Promise((resolve) => setTimeout(resolve, 400));

        // 🎯 通过指令中心执行工具调用
        const result = await CommandCenter.executeToolCall(toolCall);
        commandResults.push(result);

        // 更新为完成状态
        setToolExecutions((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, status: "completed" as const } : item
          )
        );

        // 延迟一下再执行下一个工具
        if (index < toolCalls.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      // 所有工具执行完成后，延迟1秒清空工具列表
      setTimeout(() => {
        setToolExecutions([]);
      }, 1000);

      return {
        commandResults,
        response,
      };
    },
    [getToolDisplayName]
  );

  // 调用AI接口
  const callAI = useCallback(
    async (userQuery: string) => {
      try {
        console.log("🤖 开始调用AI分析指令:", userQuery);

        const toolCalls = await aiAgentService.preRequest(userQuery);
        if (toolCalls.toolCalls.length === 0) {
          console.log("💬 AI回复:", toolCalls.answer);

          // 显示 AI 回复内容在弹窗上
          setAiReplyContent(toolCalls.answer || "抱歉，我没有理解您的问题");
          setIsAnalyzing(false);

          return {
            content: toolCalls.answer,
          };
        }

        // 🎯 从指令中心获取所有已注册的工具
        const neededTools = toolCalls.toolCalls.map(
          (toolCall) => toolCall.function.name
        );
        const tools = CommandCenter.getTools().filter((tool) =>
          neededTools.includes(tool.function.name)
        );
        console.log(
          `📦 需要调用的工具: ${neededTools.join(", ")}，筛选后工具数量: ${
            tools.length
          }`
        );

        // 调用 AI Agent 服务，传入可用工具
        const response = await aiAgentService.processQueryWithDeepSeek({
          query: userQuery,
          tools,
        });

        console.log("✅ AI响应:", response);

        // 处理工具调用（异步执行，会更新 UI 状态并关闭弹窗）
        const toolResult = await handleToolCall(response);

        if (response.content) {
          console.log("💬 AI回复:", response.content);
        }
        return toolResult || response;
      } catch (error) {
        console.error("❌ AI调用失败:", error);
        // 出错也关闭弹窗
        setTimeout(() => {
          closeModal();
        }, 500);
        return {
          error: error instanceof Error ? error.message : "未知错误",
        };
      }
    },
    [handleToolCall, closeModal]
  );

  // 用户提交问题
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        return;
      }

      setIsAnalyzing(true);
      setAiReplyContent("");
      setToolExecutions([]);

      await callAI(trimmedQuery);
    },
    [query, callAI]
  );

  return (
    <>
      {/* AI 助手图标 */}
      <button
        onClick={handleIconClick}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
        aria-label="打开 AI 助手"
      >
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>

      {/* 弹窗 */}
      {isModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">AI 助手</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
                aria-label="关闭"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* 如果有 AI 回复内容，显示回复 */}
            {aiReplyContent ? (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">AI 回复</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {aiReplyContent}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  关闭
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="query"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    请输入您的问题
                  </label>
                  <textarea
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="例如：跳转到笔记页面"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    disabled={isAnalyzing}
                  />
                </div>

                {isAnalyzing && (
                  <div className="mb-4 text-center text-gray-600">
                    正在分析中...
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!query.trim() || isAnalyzing}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    提交
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 工具执行状态列表 - 独立在弹窗外部 */}
      {toolExecutions.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 bg-white rounded-lg shadow-xl p-4 max-w-sm">
          <h3 className="text-lg font-semibold mb-2">
            {toolExecutions.every((t) => t.status === "completed")
              ? "✅ 指令执行完成"
              : "⚙️ 正在执行指令"}
          </h3>
          <div className="space-y-2">
            {toolExecutions.map((tool, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-2 rounded ${
                  tool.status === "pending"
                    ? "bg-gray-100"
                    : tool.status === "executing"
                    ? "bg-blue-100"
                    : "bg-green-100"
                }`}
              >
                <span className="text-xl">
                  {tool.status === "pending" && "⏳"}
                  {tool.status === "executing" && "▶️"}
                  {tool.status === "completed" && "✓"}
                </span>
                <span className="text-sm">{tool.displayName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
