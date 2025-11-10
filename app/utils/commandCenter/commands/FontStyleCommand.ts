import { CommandHandler } from "../CommandCenter";
import { FontStyleEventCenter } from "@/app/events/fontStyleEvent";

/**
 * 字体大小调整指令处理器
 */
export class ChangeFontSizeCommand implements CommandHandler {
  tool = {
    type: "function" as const,
    function: {
      name: "change_font_size",
      description:
        '字体大小调整工具，用于调整字体大小。支持两种模式：1) 相对调整：用户说"把xxx调大一点"、"把xxx调小一点"时，使用scale参数，基数是1（如1.1表示放大10%，0.9表示缩小10%）；2) 绝对值：用户说"把xxx调到50"、"把xxx改成32"时，使用size参数设置具体数值。',
      parameters: {
        type: "object",
        properties: {
          size: {
            type: "number",
            description:
              '字体的绝对大小值（像素），用于"调到XX"、"改成XX"等场景',
          },
          scale: {
            type: "number",
            description:
              '字体的缩放比例，基数是1。如1.1表示放大10%，0.9表示缩小10%，用于"调大一点"、"调小一点"等场景',
          },
          content: {
            type: "string",
            description: "需要调整字体大小的内容",
            enum: FontStyleEventCenter.getTextEnums(),
          },
        },
        required: ["content"],
      },
    },
  };

  /**
   * 执行字体大小调整
   */
  execute(args: Record<string, any>): void {
    const { size, scale, content } = args as {
      size?: number;
      scale?: number;
      content: string;
    };
    FontStyleEventCenter.emit(`changeSize-${content}`, { size, scale });
  }
}

/**
 * 字体颜色调整指令处理器
 */
export class ChangeFontColorCommand implements CommandHandler {
  tool = {
    type: "function" as const,
    function: {
      name: "change_font_color",
      description:
        '字体颜色调整工具，用于调整字体颜色。用户可以通过语音或文字说明调整字体颜色，如"我要调整字体颜色"、"把字体改成XXX"。',
      parameters: {
        type: "object",
        properties: {
          color: {
            type: "string",
            description:
              '字体的颜色值，用于"改成XXX"等场景，必须是十六进制颜色值，如#3072F6',
          },
          content: {
            type: "string",
            description: "需要调整字体颜色的内容",
            enum: FontStyleEventCenter.getTextEnums(),
          },
        },
        required: ["content", "color"],
      },
    },
  };

  /**
   * 执行字体颜色调整
   */
  execute(args: Record<string, any>): void {
    const { color, content } = args as { color: string; content: string };
    FontStyleEventCenter.emit(`changeColor-${content}`, { color });
  }
}
