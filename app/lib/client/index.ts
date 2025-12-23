/**
 * 客户端服务模块统一导出
 * 运行环境：浏览器 (前端 UI 层)
 */

// AI 服务
export * from "./ai-agent";

// 存储服务
export * from "./message-storage";
export * from "./note-storage";
export * from "./todo-storage";
export * from "./user-storage";

// API 客户端
export { apiClient, saveAuthToken, clearAuthToken, isOnline } from "./api-client";
export type { ApiResponse } from "./api-client";
