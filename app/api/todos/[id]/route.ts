/**
 * 待办事项 API - 单个待办操作
 * GET /api/todos/[id] - 获取单个待办
 * PATCH /api/todos/[id] - 更新待办
 * DELETE /api/todos/[id] - 删除待办
 */

import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/server/mongodb";
import { Todo } from "@/app/lib/server/models";
import {
  authMiddleware,
  createAuthErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/app/lib/server/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET - 获取单个待办
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // 验证认证
    const authResult = await authMiddleware(request);

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error || "认证失败");
    }

    // 连接数据库
    await connectDB();

    // 获取待办 ID
    const { id } = await params;

    // 验证 ID 格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return createErrorResponse("无效的待办ID", 400);
    }

    // 查找待办
    const todo = await Todo.findOne({
      _id: id,
      userId: authResult.userId,
    }).lean();

    if (!todo) {
      return createErrorResponse("待办不存在", 404);
    }

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

    return createSuccessResponse(todoResponse, "获取待办成功");
  } catch (error) {
    console.error("获取待办失败:", error);
    return createErrorResponse("获取待办失败", 500);
  }
}

/**
 * PATCH - 更新待办
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // 验证认证
    const authResult = await authMiddleware(request);

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error || "认证失败");
    }

    // 连接数据库
    await connectDB();

    // 获取待办 ID
    const { id } = await params;

    // 验证 ID 格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return createErrorResponse("无效的待办ID", 400);
    }

    // 解析请求体
    const body = await request.json();
    const { title, description, completed, dueDate, tags } = body;

    // 构建更新对象
    const updates: Record<string, unknown> = {};

    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        return createErrorResponse("标题不能为空", 400);
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description || undefined;
    }

    if (completed !== undefined) {
      updates.completed = completed;
    }

    if (dueDate !== undefined) {
      updates.dueDate = dueDate ? new Date(dueDate) : undefined;
    }

    if (tags !== undefined) {
      updates.tags = tags;
    }

    // 如果没有要更新的字段
    if (Object.keys(updates).length === 0) {
      return createErrorResponse("没有要更新的字段", 400);
    }

    // 更新待办
    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: authResult.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return createErrorResponse("待办不存在", 404);
    }

    // 返回更新后的待办信息
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

    return createSuccessResponse(todoResponse, "更新待办成功");
  } catch (error: unknown) {
    console.error("更新待办失败:", error);

    // 处理 Mongoose 验证错误
    if (error && typeof error === 'object' && 'name' in error && error.name === "ValidationError") {
      const validationError = error as { errors?: Record<string, { message: string }> };
      const messages = Object.values(validationError.errors || {}).map(
        (err) => err.message
      );
      return createErrorResponse(messages.join(", "), 400);
    }

    return createErrorResponse("更新待办失败", 500);
  }
}

/**
 * DELETE - 删除待办
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // 验证认证
    const authResult = await authMiddleware(request);

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error || "认证失败");
    }

    // 连接数据库
    await connectDB();

    // 获取待办 ID
    const { id } = await params;

    // 验证 ID 格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return createErrorResponse("无效的待办ID", 400);
    }

    // 删除待办
    const result = await Todo.deleteOne({
      _id: id,
      userId: authResult.userId,
    });

    if (result.deletedCount === 0) {
      return createErrorResponse("待办不存在", 404);
    }

    return createSuccessResponse(null, "删除待办成功");
  } catch (error) {
    console.error("删除待办失败:", error);
    return createErrorResponse("删除待办失败", 500);
  }
}

