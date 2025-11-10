import { CommandHandler } from "../CommandCenter";
import { FormEventCenter } from "@/app/events/formEvent";

interface FormItem {
  name: string;
  label?: string;
  type?: string;
  options?: Array<{ value: string; label: string }>;
}

/**
 * 表单修改指令处理器工厂
 * 每个表单会创建一个独立的指令处理器
 */
export class FormCommand implements CommandHandler {
  private formId: string;

  constructor(formId: string) {
    this.formId = formId;
  }

  get tool() {
    return {
      type: "function" as const,
      function: {
        name: `change_form_values-${this.formId}`,
        description: this.generateFormDescription(),
        parameters: {
          type: "object",
          properties: this.generateFormItemsProperties(),
        },
      },
    };
  }

  /**
   * 生成表单工具描述
   */
  private generateFormDescription(): string {
    const scenarios = FormEventCenter.getItems(this.formId)
      .map((item) => {
        return `${item.name}:${item.label || item.name}`;
      })
      .join("、");
    return `表单工具，用于调整表单内容。名字和key的映射关系：${scenarios}。只需匹配最相关的表单即可。`;
  }

  /**
   * UI类型转JSON类型
   */
  private uiType2JsonType(item: FormItem): "string" | "number" | "boolean" {
    switch (item.type) {
      case "number":
        return "number";
      default:
        return "string";
    }
  }

  /**
   * 生成表单项属性定义
   */
  private generateFormItemsProperties(): Record<string, Record<string, any>> {
    const items = FormEventCenter.getItems(this.formId);
    return items.reduce(
      (acc, item) => {
        acc[item.name] = {
          type: this.uiType2JsonType(item),
          description: item.label || `英文名称:${item.name}`,
          ...(item.options
            ? { enum: item.options.map((option) => option.value) }
            : {}),
          ...(item.type === "date" ? { format: "date" } : {}),
        };
        return acc;
      },
      {} as Record<string, Record<string, any>>,
    );
  }

  /**
   * 执行表单修改
   */
  execute(args: Record<string, any>): void {
    FormEventCenter.emit(this.formId, args);
  }
}

/**
 * 生成所有表单的指令处理器
 */
export function generateFormCommands(): CommandHandler[] {
  return FormEventCenter.getFormIds().map(
    (formId) => new FormCommand(formId),
  );
}

