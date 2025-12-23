/**
 * 聊天消息 API - 获取所有消息 & 创建消息
 * GET /api/messages - 获取用户所有消息
 * POST /api/messages - 创建新消息
 * DELETE /api/messages - 清空所有消息
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/app/lib/server/mongodb";
import { Message } from "@/app/lib/server/models";
import {
  authMiddleware,
  createAuthErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/app/lib/server/auth";

/**
 * GET - 获取用户所有消息
 */
export async function GET(request: NextRequest) {
  try {
    // 验证认证
    const authResult = await authMiddleware(request);

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error || "认证失败");
    }

    // 连接数据库
    await connectDB();

    // 查询消息
    const messages = await Message.find({ userId: authResult.userId })
      .sort({ timestamp: 1 })
      .lean();

    // 转换为前端格式
    const messagesResponse = messages.map((msg) => ({
      id: msg._id.toString(),
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    }));

    return createSuccessResponse(messagesResponse, "获取消息成功");
  } catch (error) {
    console.error("获取消息失败:", error);
    return createErrorResponse("获取消息失败", 500);
  }
}

/**
 * POST - 创建新消息
 */
export async function POST(request: NextRequest) {
  try {
    // 验证认证
    const authResult = await authMiddleware(request);

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error || "认证失败");
    }

    // 连接数据库
    await connectDB();

    // 解析请求体
    const body = await request.json();
    const { role, content, timestamp } = body;

    // 验证必填字段
    if (!role || !content) {
      return createErrorResponse("角色和内容不能为空", 400);
    }

    // 验证角色
    if (role !== "user" && role !== "assistant") {
      return createErrorResponse("角色必须是 user 或 assistant", 400);
    }

    // 创建消息
    const message = await Message.create({
      userId: authResult.userId,
      role,
      content,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    // 返回消息信息
    const messageResponse = {
      id: message._id.toString(),
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
    };

    return createSuccessResponse(messageResponse, "创建消息成功");
  } catch (error: unknown) {
    console.error("创建消息失败:", error);

    // 处理 Mongoose 验证错误
    if (error && typeof error === 'object' && 'name' in error && error.name === "ValidationError") {
      const validationError = error as { errors?: Record<string, { message: string }> };
      const messages = Object.values(validationError.errors || {}).map(
        (err) => err.message
      );
      return createErrorResponse(messages.join(", "), 400);
    }

    return createErrorResponse("创建消息失败", 500);
  }
}

/**
 * DELETE - 清空所有消息
 */
export async function DELETE(request: NextRequest) {
  try {
    // 验证认证
    const authResult = await authMiddleware(request);

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error || "认证失败");
    }

    // 连接数据库
    await connectDB();

    // 删除所有用户消息
    await Message.deleteMany({ userId: authResult.userId });

    return createSuccessResponse(null, "清空消息成功");
  } catch (error) {
    console.error("清空消息失败:", error);
    return createErrorResponse("清空消息失败", 500);
  }
}

