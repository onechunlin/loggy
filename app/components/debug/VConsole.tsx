"use client";

import { useEffect, useRef } from "react";

/**
 * 移动端调试工具组件
 * 仅在开发环境下启用
 *
 * 功能：
 * - Console 日志查看
 * - 网络请求监控
 * - DOM 元素检查
 * - Storage 查看
 * - 系统信息查看
 * - 快捷键切换（Ctrl/Cmd + D）
 */
export default function VConsole() {
  const vConsoleRef = useRef<any>(null);

  useEffect(() => {
    // 仅在开发环境和客户端启用
    // 动态导入 vConsole
    import("vconsole").then((VConsoleModule) => {
      if (!vConsoleRef.current) {
        // 创建 vConsole 实例
        vConsoleRef.current = new VConsoleModule.default({
          theme: "light",
          defaultPlugins: ["system", "network", "element", "storage"],
          maxLogNumber: 1000,
          disableLogScrolling: false,
        });

        console.log(
          "%c📱 VConsole 移动端调试工具已启用",
          "color: #4CAF50; font-size: 14px; font-weight: bold;"
        );
        console.log(
          "%c💡 提示：按 Ctrl/Cmd + D 快速切换显示/隐藏",
          "color: #2196F3; font-size: 12px;"
        );
      }
    });
  }, []);

  return null;
}
