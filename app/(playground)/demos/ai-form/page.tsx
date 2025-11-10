"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/app/components/layout/MainLayout";
import { DynamicForm, type FormItemConfig } from "@/app/components/ui";

/**
 * AI 智能表单 Demo 页面
 */
export default function AIFormDemoPage() {
  const router = useRouter();
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

  return (
    <MainLayout showTabBar={false}>
      <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          {/* 返回按钮 */}
          <button
            onClick={() => router.push("/playground")}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="text-lg">←</span>
            <span className="text-sm">返回 Playground</span>
          </button>

          {/* 标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🤖 AI 智能表单
            </h1>
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
    </MainLayout>
  );
}
