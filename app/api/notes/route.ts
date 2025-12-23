/**
 * 笔记 API - 获取所有笔记 & 创建笔记
 * GET /api/notes - 获取用户所有笔记
 * POST /api/notes - 创建新笔记
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/app/lib/server/mongodb";
import { Note } from "@/app/lib/server/models";
import {
  authMiddleware,
  createAuthErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/app/lib/server/auth";

/**
 * GET - 获取用户所有笔记
 * 支持查询参数：
 * - tags: 标签过滤（逗号分隔）
 * - isStarred: 是否收藏（true/false）
 * - search: 搜索关键词
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
    const tagsParam = searchParams.get("tags");
    const isStarredParam = searchParams.get("isStarred");
    const searchParam = searchParams.get("search");

    // 构建查询条件
    const query: Record<string, unknown> = { userId: authResult.userId };

    // 标签过滤
    if (tagsParam) {
      const tags = tagsParam.split(",").filter((t) => t.trim());
      if (tags.length > 0) {
        query.tags = { $in: tags };
      }
    }

    // 收藏过滤
    if (isStarredParam) {
      query.isStarred = isStarredParam === "true";
    }

    // 搜索关键词
    if (searchParam && searchParam.trim()) {
      query.$or = [
        { title: { $regex: searchParam, $options: "i" } },
        { content: { $regex: searchParam, $options: "i" } },
      ];
    }

    // 查询笔记
    const notes = await Note.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // 转换为前端格式
    const notesResponse = notes.map((note) => ({
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      tags: note.tags,
      isStarred: note.isStarred,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    }));

    return createSuccessResponse(notesResponse, "获取笔记成功");
  } catch (error) {
    console.error("获取笔记失败:", error);
    return createErrorResponse("获取笔记失败", 500);
  }
}

/**
 * POST - 创建新笔记
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
    const { title, content, tags } = body;

    // 验证必填字段
    if (!title || title.trim().length === 0) {
      return createErrorResponse("标题不能为空", 400);
    }

    // 创建笔记
    const note = await Note.create({
      userId: authResult.userId,
      title: title.trim(),
      content: content || "",
      tags: tags || [],
    });

    // 返回笔记信息
    const noteResponse = {
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      tags: note.tags,
      isStarred: note.isStarred,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };

    return createSuccessResponse(noteResponse, "创建笔记成功");
  } catch (error: unknown) {
    console.error("创建笔记失败:", error);

    // 处理 Mongoose 验证错误
    if (error && typeof error === 'object' && 'name' in error && error.name === "ValidationError") {
      const validationError = error as { errors?: Record<string, { message: string }> };
      const messages = Object.values(validationError.errors || {}).map(
        (err) => err.message
      );
      return createErrorResponse(messages.join(", "), 400);
    }

    return createErrorResponse("创建笔记失败", 500);
  }
}

