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
    description: "查看首页、主页、首页数据、回到首页、主界面",
  },
  "/notes": {
    name: "笔记列表",
    description: "查看笔记、笔记列表、我的笔记、笔记管理、所有笔记",
  },
  "/todos": {
    name: "待办列表",
    description: "查看待办、待办列表、我的待办、任务管理、待办事项、任务列表",
  },
  "/chat": {
    name: "AI对话",
    description: "AI对话、AI助手、AI聊天、AI问答、AI客服、聊天、对话",
  },
  "/profile": {
    name: "个人中心",
    description: "个人中心、我的、用户中心、个人资料、账户设置、设置",
  },
  "/demo-list": {
    name: "实验室",
    description: "实验室、演示列表、功能演示、Playground、Demo列表、示例",
  },
  "/demos/ai-form": {
    name: "AI智能表单",
    description: "AI表单、智能表单、动态表单、表单示例",
  },
  "/demos/ai-text": {
    name: "AI文本",
    description: "AI文本、文本样式、动态文本、文本示例",
  },
  "/demos/api-error": {
    name: "API错误演示",
    description: "API错误、接口错误、协议不对齐、错误演示",
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
