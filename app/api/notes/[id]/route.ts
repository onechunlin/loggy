/**
 * 笔记 API - 单个笔记操作
 * GET /api/notes/[id] - 获取单个笔记
 * PATCH /api/notes/[id] - 更新笔记
 * DELETE /api/notes/[id] - 删除笔记
 */

import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/server/mongodb";
import { Note } from "@/app/lib/server/models";
import {
  authMiddleware,
  createAuthErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/app/lib/server/auth";
import { triggerNoteEmbedding } from "@/app/lib/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET - 获取单个笔记
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

    // 获取笔记 ID
    const { id } = await params;

    // 验证 ID 格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return createErrorResponse("无效的笔记ID", 400);
    }

    // 查找笔记
    const note = await Note.findOne({
      _id: id,
      userId: authResult.userId,
    }).lean();

    if (!note) {
      return createErrorResponse("笔记不存在", 404);
    }

    // 返回笔记信息
    const noteResponse = {
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      isStarred: note.isStarred,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };

    return createSuccessResponse(noteResponse, "获取笔记成功");
  } catch (error) {
    console.error("获取笔记失败:", error);
    return createErrorResponse("获取笔记失败", 500);
  }
}

/**
 * PATCH - 更新笔记
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

    // 获取笔记 ID
    const { id } = await params;

    // 验证 ID 格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return createErrorResponse("无效的笔记ID", 400);
    }

    // 解析请求体
    const body = await request.json();
    const { title, content, isStarred } = body;

    // 构建更新对象
    const updates: Record<string, unknown> = {};

    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        return createErrorResponse("标题不能为空", 400);
      }
      updates.title = title.trim();
    }

    if (content !== undefined) {
      updates.content = content;
    }

    if (isStarred !== undefined) {
      updates.isStarred = isStarred;
    }

    // 如果没有要更新的字段
    if (Object.keys(updates).length === 0) {
      return createErrorResponse("没有要更新的字段", 400);
    }

    // 更新笔记
    const note = await Note.findOneAndUpdate(
      { _id: id, userId: authResult.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!note) {
      return createErrorResponse("笔记不存在", 404);
    }

    // 如果内容相关字段发生变化，异步重新生成 embedding
    const contentChanged = title !== undefined || content !== undefined;
    if (contentChanged) {
      triggerNoteEmbedding(note._id.toString(), note.title, note.content);
    }

    // 返回更新后的笔记信息
    const noteResponse = {
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      isStarred: note.isStarred,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };

    return createSuccessResponse(noteResponse, "更新笔记成功");
  } catch (error: unknown) {
    console.error("更新笔记失败:", error);

    // 处理 Mongoose 验证错误
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ValidationError"
    ) {
      const validationError = error as {
        errors?: Record<string, { message: string }>;
      };
      const messages = Object.values(validationError.errors || {}).map(
        (err) => err.message
      );
      return createErrorResponse(messages.join(", "), 400);
    }

    return createErrorResponse("更新笔记失败", 500);
  }
}

/**
 * DELETE - 删除笔记
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

    // 获取笔记 ID
    const { id } = await params;

    // 验证 ID 格式
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return createErrorResponse("无效的笔记ID", 400);
    }

    // 删除笔记
    const result = await Note.deleteOne({
      _id: id,
      userId: authResult.userId,
    });

    if (result.deletedCount === 0) {
      return createErrorResponse("笔记不存在", 404);
    }

    return createSuccessResponse(null, "删除笔记成功");
  } catch (error) {
    console.error("删除笔记失败:", error);
    return createErrorResponse("删除笔记失败", 500);
  }
}
