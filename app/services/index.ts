/**
 * 服务模块统一导出（已废弃，请使用 lib/server 和 lib/client）
 *
 * @deprecated 请使用以下导入：
 * - 服务端服务：import { ... } from "@/app/lib/server"
 * - 客户端服务：import { ... } from "@/app/lib/client"
 */

// 为了向后兼容，重新导出
export * from "@/app/lib/server";
export * from "@/app/lib/client";
