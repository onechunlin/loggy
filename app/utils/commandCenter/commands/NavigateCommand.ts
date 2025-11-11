import { CommandHandler } from "../CommandCenter";
import {
  NavigatePageEventCenter,
  NavigatePageEventName,
} from "@/app/events/navigatePageEvent";

/**
 * 页面路由配置
 * key: 路径, value: { name: 页面名称, description: 触发描述 }
 */
export const PAGE_ROUTES = {
  "/": {
    name: "首页",
    description: "查看首页、主页、首页数据",
  },
  "/notes": {
    name: "笔记列表",
    description: "查看笔记、笔记列表、我的笔记",
  },
  "/todos": {
    name: "待办列表",
    description: "查看待办、待办列表、我的待办",
  },
  "/chat": {
    name: "AI对话",
    description: "AI对话、AI助手、AI聊天、AI问答、AI客服",
  },
  "/playground": {
    name: "演示页面",
    description: "查看演示、演示页面、功能演示",
  },
} as const;

/**
 * 页面导航指令处理器
 */
export class NavigateCommand implements CommandHandler {
  tool = {
    type: "function" as const,
    function: {
      name: "navigate_to_page",
      description: this.generatePageToolDescription(),
      parameters: {
        type: "object",
        properties: {
          page_path: {
            type: "string",
            description: "页面路径",
            enum: Object.keys(PAGE_ROUTES),
          },
        },
        required: ["page_path"],
      },
    },
  };

  /**
   * 生成页面工具描述
   */
  private generatePageToolDescription(): string {
    const scenarios = Object.entries(PAGE_ROUTES)
      .map(([_path, route]) => {
        return `${route.name}（${route.description.split("、")[0]}）`;
      })
      .join("、");

    return `页面导航工具，根据用户意图跳转到对应页面。支持：${scenarios}。只需匹配最相关的页面即可。`;
  }

  /**
   * 执行页面导航
   */
  execute(args: Record<string, any>): void {
    const { page_path } = args as { page_path: string };
    NavigatePageEventCenter.emit(NavigatePageEventName.NavigateToPage, {
      pagePath: page_path,
    });
  }
}

