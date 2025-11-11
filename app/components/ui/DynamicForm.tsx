"use client";

import { FormEventCenter, FormEventConfig } from "@/app/events";
import { Form, Input, TextArea, Button } from "antd-mobile";
import type { FormItemProps } from "antd-mobile/es/components/form";
import { useEffect, useId } from "react";

/**
 * 表单字段配置
 */
export interface FormItemConfig {
  type:
    | "input-text"
    | "input-email"
    | "input-password"
    | "textarea"
    | "input-number";
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  rules?: FormItemProps["rules"];
}

interface DynamicFormProps {
  items: FormItemConfig[];
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void;
  submitText?: string;
  layout?: "vertical" | "horizontal";
}

/**
 * 动态表单组件
 * 基于 antd-mobile Form 组件实现
 */
export default function DynamicForm({
  items,
  initialValues = {},
  onSubmit,
  submitText = "提交",
  layout = "vertical",
}: DynamicFormProps) {
  const [form] = Form.useForm();
  const formId = useId();

  useEffect(() => {
    FormEventCenter.registerItems(formId, items);
    FormEventCenter.on(formId, (config: FormEventConfig) => {
      form.setFieldsValue(config);
    });
    return () => {
      FormEventCenter.unregisterItems(formId);
      FormEventCenter.off(formId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const handleFinish = (values: Record<string, any>) => {
    onSubmit?.(values);
  };

  const renderFormItem = (item: FormItemConfig) => {
    const rules = [...(item.rules || [])];
    if (item.required) {
      rules.push({ required: true, message: `请输入${item.label}` });
    }

    switch (item.type) {
      case "input-text":
        return (
          <Form.Item
            key={item.name}
            name={item.name}
            label={item.label}
            rules={rules}
          >
            <Input
              placeholder={item.placeholder || `请输入${item.label}`}
              clearable
            />
          </Form.Item>
        );

      case "input-email":
        return (
          <Form.Item
            key={item.name}
            name={item.name}
            label={item.label}
            rules={[
              ...rules,
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
          >
            <Input
              type="email"
              placeholder={item.placeholder || `请输入${item.label}`}
              clearable
            />
          </Form.Item>
        );

      case "input-password":
        return (
          <Form.Item
            key={item.name}
            name={item.name}
            label={item.label}
            rules={rules}
          >
            <Input
              type="password"
              placeholder={item.placeholder || `请输入${item.label}`}
              clearable
            />
          </Form.Item>
        );

      case "input-number":
        return (
          <Form.Item
            key={item.name}
            name={item.name}
            label={item.label}
            rules={rules}
          >
            <Input
              type="number"
              placeholder={item.placeholder || `请输入${item.label}`}
              clearable
            />
          </Form.Item>
        );

      case "textarea":
        return (
          <Form.Item
            key={item.name}
            name={item.name}
            label={item.label}
            rules={rules}
          >
            <TextArea
              placeholder={item.placeholder || `请输入${item.label}`}
              rows={4}
              showCount
            />
          </Form.Item>
        );

      default:
        return null;
    }
  };

  return (
    <Form
      form={form}
      initialValues={initialValues}
      layout={layout}
      onFinish={handleFinish}
      footer={
        onSubmit && (
          <Button block type="submit" color="primary" size="large">
            {submitText}
          </Button>
        )
      }
    >
      {items.map((item) => renderFormItem(item))}
    </Form>
  );
}
