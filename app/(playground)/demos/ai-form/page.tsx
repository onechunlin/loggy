"use client";

import { useState } from "react";
import { DynamicForm, type FormItemConfig } from "@/app/components/ui";
import {
  AIAssistantEventCenter,
  AIAssistantEventName,
} from "@/app/events/aiAssistantEvent";

/**
 * AI 智能表单 Demo 页面
 */
export default function AIFormDemoPage() {
  const [formData, setFormData] = useState<Record<string, any> | null>(null);

  const formItems: FormItemConfig[] = [
    {
      type: "input-text",
      name: "name",
      label: "姓名：",
      placeholder: "请输入您的姓名",
      required: true,
    },
    {
      name: "email",
      type: "input-email",
      label: "邮箱：",
      placeholder: "请输入您的邮箱",
      required: true,
    },
    {
      name: "phone",
      type: "input-number",
      label: "电话：",
      placeholder: "请输入您的电话",
    },
    {
      name: "message",
      type: "textarea",
      label: "爱好：",
      placeholder: "请输入您的爱好",
    },
  ];

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    message: "",
  };

  const handleSubmit = (values: Record<string, any>) => {
    setFormData(values);
    console.log("表单提交数据:", values);
  };

  const handleAIAssist = () => {
    // 根据表单字段生成初始查询
    const query = `请帮我填写表单，我的名字是张三，邮箱是zhangsan@example.com，电话是幺三七八八四五零零二八，喜欢打篮球`;
    console.log("🚀 ~ handleAIAssist ~ query:", query);

    // 触发打开 AIAssistant 事件
    AIAssistantEventCenter.emit(AIAssistantEventName.OpenAssistant, {
      query,
    });
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">🤖 AI 智能表单</h1>
            <button
              onClick={handleAIAssist}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-2"
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
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              AI辅助填写
            </button>
          </div>
          <p className="text-gray-600">
            基于 antd-mobile 的动态表单组件，支持多种输入类型和自动验证
          </p>
        </div>

        {/* 表单 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-6">
          <DynamicForm
            items={formItems}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitText="提交表单"
            layout="vertical"
          />
        </div>

        {/* 提交结果 */}
        {formData && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📋 提交结果
            </h2>
            <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
