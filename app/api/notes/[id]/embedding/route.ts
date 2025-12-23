/**
 * 笔记 Embedding 状态检查 API
 * GET /api/notes/[id]/embedding - 检查笔记的 embedding 状态
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

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET - 获取笔记的 embedding 状态
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

    // 查找笔记（包含 embedding 字段）
    const note = await Note.findOne({
      _id: id,
      userId: authResult.userId,
    })
      .select("+embedding") // 显式包含 embedding 字段
      .lean();

    if (!note) {
      return createErrorResponse("笔记不存在", 404);
    }

    // 构建 embedding 状态信息
    const embeddingStatus = {
      noteId: note._id.toString(),
      title: note.title,
      hasEmbedding: !!note.embedding && note.embedding.length > 0,
      embeddingDimensions: note.embedding?.length || 0,
      embeddingModel: note.embeddingModel || null,
      lastEmbeddedAt: note.lastEmbeddedAt || null,
      embeddingSample: note.embedding?.slice(0, 5) || [], // 只显示前 5 个值作为示例
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };

    return createSuccessResponse(embeddingStatus, "获取 embedding 状态成功");
  } catch (error) {
    console.error("获取 embedding 状态失败:", error);
    return createErrorResponse("获取 embedding 状态失败", 500);
  }
}

