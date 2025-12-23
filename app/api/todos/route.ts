/**
 * 待办事项 API - 获取所有待办 & 创建待办
 * GET /api/todos - 获取用户所有待办
 * POST /api/todos - 创建新待办
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/app/lib/server/mongodb";
import { Todo } from "@/app/lib/server/models";
import {
  authMiddleware,
  createAuthErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/app/lib/server/auth";

/**
 * GET - 获取用户所有待办
 * 支持查询参数：
 * - completed: 完成状态过滤（true/false）
 * - tags: 标签过滤（逗号分隔）
 * - overdue: 是否逾期（true/false）
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

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const completedParam = searchParams.get("completed");
    const tagsParam = searchParams.get("tags");
    const overdueParam = searchParams.get("overdue");

    // 构建查询条件
    const query: Record<string, unknown> = { userId: authResult.userId };

    // 完成状态过滤
    if (completedParam) {
      query.completed = completedParam === "true";
    }

    // 标签过滤
    if (tagsParam) {
      const tags = tagsParam.split(",").filter((t) => t.trim());
      if (tags.length > 0) {
        query.tags = { $in: tags };
      }
    }

    // 逾期过滤
    if (overdueParam === "true") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.dueDate = { $lt: today };
      query.completed = false;
    }

    // 查询待办
    const todos = await Todo.find(query)
      .sort({ completed: 1, createdAt: -1 })
      .lean();

    // 转换为前端格式
    const todosResponse = todos.map((todo) => ({
      id: todo._id.toString(),
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      dueDate: todo.dueDate,
      tags: todo.tags,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    }));

    return createSuccessResponse(todosResponse, "获取待办成功");
  } catch (error) {
    console.error("获取待办失败:", error);
    return createErrorResponse("获取待办失败", 500);
  }
}

/**
 * POST - 创建新待办
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
    const { title, description, dueDate, tags } = body;

    // 验证必填字段
    if (!title || title.trim().length === 0) {
      return createErrorResponse("标题不能为空", 400);
    }

    // 创建待办
    const todo = await Todo.create({
      userId: authResult.userId,
      title: title.trim(),
      description: description || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: tags || [],
    });

    // 返回待办信息
    const todoResponse = {
      id: todo._id.toString(),
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
      dueDate: todo.dueDate,
      tags: todo.tags,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };

    return createSuccessResponse(todoResponse, "创建待办成功");
  } catch (error: unknown) {
    console.error("创建待办失败:", error);

    // 处理 Mongoose 验证错误
    if (error && typeof error === 'object' && 'name' in error && error.name === "ValidationError") {
      const validationError = error as { errors?: Record<string, { message: string }> };
      const messages = Object.values(validationError.errors || {}).map(
        (err) => err.message
      );
      return createErrorResponse(messages.join(", "), 400);
    }

    return createErrorResponse("创建待办失败", 500);
  }
}

