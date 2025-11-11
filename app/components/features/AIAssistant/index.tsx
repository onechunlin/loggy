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
import {
  AIAssistantEventCenter,
  AIAssistantEventName,
} from "@/app/events/aiAssistantEvent";

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

    // 监听打开 AIAssistant 事件
    const handleOpenAssistant = (config: { query?: string }) => {
      setIsModalVisible(true);
      setQuery(config.query || "");
      setIsAnalyzing(false);
      setToolExecutions([]);
      setAiReplyContent("");
    };

    AIAssistantEventCenter.on(
      AIAssistantEventName.OpenAssistant,
      handleOpenAssistant
    );

    // 组件卸载时清理
    return () => {
      console.log("🧹 组件卸载，清空指令中心");
      CommandCenter.clear();
      AIAssistantEventCenter.off(AIAssistantEventName.OpenAssistant);
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

      // 立即关闭弹窗，显示工具执行列表
      setIsModalVisible(false);
      setQuery("");
      setAiReplyContent("");

      // 延迟一下让用户看到工具列表
      await new Promise((resolve) => setTimeout(resolve, 300));

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

      // 所有工具执行完成后，延迟1秒后关闭执行列表
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

        // 如果是闲聊内容（没有工具调用），直接显示回复，保持弹窗打开
        if (toolCalls.toolCalls.length === 0) {
          console.log("💬 AI回复（闲聊）:", toolCalls.answer);

          // 显示 AI 回复内容在弹窗上，保持弹窗打开
          setAiReplyContent(toolCalls.answer || "抱歉，我没有理解您的问题");
          setIsAnalyzing(false);
          // 保持弹窗打开，不关闭

          return {
            content: toolCalls.answer,
          };
        }

        // 如果有工具调用，关闭弹窗并显示工具执行列表
        console.log("🔧 检测到工具调用，关闭弹窗并显示执行列表");

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
        // 出错时显示错误信息在弹窗中
        setAiReplyContent("抱歉，处理您的请求时出现了错误，请稍后再试");
        setIsAnalyzing(false);
        return {
          error: error instanceof Error ? error.message : "未知错误",
        };
      }
    },
    [handleToolCall]
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
        className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl hover:scale-110 transition-all duration-300 group"
        aria-label="打开 AI 助手"
      >
        <svg
          className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={closeModal}
        >
          <div
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-[zoomIn_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end items-center mb-4">
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                aria-label="关闭"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* 如果有 AI 回复内容（闲聊），显示回复 */}
            {aiReplyContent ? (
              <div>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 mb-4 max-h-64 overflow-y-auto border border-blue-100">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {aiReplyContent}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setQuery("");
                      setAiReplyContent("");
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    继续
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 rounded-xl hover:shadow-lg transition-all font-medium"
                  >
                    完成
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="输入你的指令..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all bg-gray-50/50"
                    rows={4}
                    disabled={isAnalyzing}
                  />
                </div>

                {isAnalyzing && (
                  <div className="mb-4 flex items-center justify-center gap-2 text-gray-500">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">处理中</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={!query.trim() || isAnalyzing}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isAnalyzing ? "处理中..." : "发送"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    取消
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 工具执行状态列表 - 居中显示，仅在工具调用时显示 */}
      {toolExecutions.length > 0 && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] max-w-[400px] p-5 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl z-[10000] animate-[zoomIn_0.3s_ease-out] border border-gray-100">
          <div className="flex items-center justify-end mb-4">
            {toolExecutions.every((t) => t.status === "completed") && (
              <button
                onClick={() => setToolExecutions([])}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                aria-label="关闭"
              >
                <svg
                  className="w-4 h-4"
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
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            {toolExecutions.map((tool, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                  tool.status === "pending"
                    ? "bg-gray-50 border border-gray-200"
                    : tool.status === "executing"
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
                    : "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                }`}
              >
                <div
                  className={`w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 ${
                    tool.status === "pending"
                      ? "bg-gray-200"
                      : tool.status === "executing"
                      ? "bg-blue-500"
                      : "bg-green-500"
                  }`}
                >
                  {tool.status === "pending" && (
                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {tool.status === "executing" && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {tool.status === "completed" && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700 font-medium flex-1">
                  {tool.displayName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
