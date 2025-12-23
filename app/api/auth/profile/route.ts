/**
 * 更新用户资料 API
 * PATCH /api/auth/profile
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

export async function PATCH(request: NextRequest) {
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
    const { nickname, email, avatar } = body;

    // 构建更新对象
    const updates: Record<string, unknown> = {};

    if (nickname !== undefined) {
      if (!nickname || nickname.trim().length === 0) {
        return createErrorResponse("昵称不能为空", 400);
      }
      updates.nickname = nickname.trim();
    }

    if (email !== undefined) {
      if (email && email.trim().length > 0) {
        // 验证邮箱格式
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
          return createErrorResponse("邮箱格式不正确", 400);
        }

        // 检查邮箱是否已被其他用户使用
        const existingUser = await User.findOne({
          email: email.trim().toLowerCase(),
          _id: { $ne: authResult.userId },
        });

        if (existingUser) {
          return createErrorResponse("该邮箱已被使用", 409);
        }

        updates.email = email.trim().toLowerCase();
      } else {
        updates.email = undefined;
      }
    }

    if (avatar !== undefined) {
      updates.avatar = avatar || undefined;
    }

    // 如果没有要更新的字段
    if (Object.keys(updates).length === 0) {
      return createErrorResponse("没有要更新的字段", 400);
    }

    // 更新用户信息
    const user = await User.findByIdAndUpdate(
      authResult.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return createErrorResponse("用户不存在", 404);
    }

    // 返回更新后的用户信息
    const userResponse = {
      id: user._id.toString(),
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
    };

    return createSuccessResponse(userResponse, "更新成功");
  } catch (error: unknown) {
    console.error("更新用户资料失败:", error);

    // 处理 Mongoose 验证错误
    if (error && typeof error === 'object' && 'name' in error && error.name === "ValidationError") {
      const validationError = error as { errors?: Record<string, { message: string }> };
      const messages = Object.values(validationError.errors || {}).map(
        (err) => err.message
      );
      return createErrorResponse(messages.join(", "), 400);
    }

    return createErrorResponse("更新失败，请稍后重试", 500);
  }
}

