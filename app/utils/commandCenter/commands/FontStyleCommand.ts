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

/**
 * 字重调整指令处理器
 */
export class ChangeFontWeightCommand implements CommandHandler {
  tool = {
    type: "function" as const,
    function: {
      name: "change_font_weight",
      description:
        '字重调整工具，用于调整字体粗细。支持字符串值（如"bold"、"normal"、"lighter"、"bolder"）或数字值（100-900，100最细，900最粗，400为normal，700为bold）。用户可以通过语音或文字说明调整字重，如"把xxx加粗"、"把xxx改为粗体"、"把xxx改为细体"等。',
      parameters: {
        type: "object",
        properties: {
          weight: {
            oneOf: [
              {
                type: "string",
                enum: ["normal", "bold", "lighter", "bolder"],
                description:
                  '字重的字符串值，用于"加粗"、"变细"等场景。normal=正常，bold=粗体，lighter=更细，bolder=更粗',
              },
              {
                type: "number",
                enum: [100, 200, 300, 400, 500, 600, 700, 800, 900],
                description:
                  "字重的数字值，用于精确控制。100最细，400为normal，700为bold，900最粗",
              },
            ],
          },
          content: {
            type: "string",
            description: "需要调整字重的内容",
            enum: FontStyleEventCenter.getTextEnums(),
          },
        },
        required: ["content", "weight"],
      },
    },
  };

  /**
   * 执行字重调整
   */
  execute(args: Record<string, any>): void {
    const { weight, content } = args as {
      weight: string | number;
      content: string;
    };
    FontStyleEventCenter.emit(`changeWeight-${content}`, { weight });
  }
}
