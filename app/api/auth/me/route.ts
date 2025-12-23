/**
 * 获取当前用户信息 API
 * GET /api/auth/me
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/app/lib/server/mongodb";
import { User } from "@/app/lib/server/models";
import {
  authMiddleware,
  createAuthErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/app/lib/server/auth";

export async function GET(request: NextRequest) {
  try {
    // 验证认证
    const authResult = await authMiddleware(request);

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error || "认证失败");
    }

    // 连接数据库
    await connectDB();

    // 查找用户
    const user = await User.findById(authResult.userId);

    if (!user) {
      return createErrorResponse("用户不存在", 404);
    }

    // 返回用户信息
    const userResponse = {
      id: user._id.toString(),
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
    };

    return createSuccessResponse(userResponse, "获取用户信息成功");
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return createErrorResponse("获取用户信息失败", 500);
  }
}
