/**
 * 修改密码 API
 * PATCH /api/auth/password
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/app/lib/server/mongodb";
import { User } from "@/app/lib/server/models";
import {
  authMiddleware,
  verifyPassword,
  hashPassword,
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
    const { oldPassword, newPassword } = body;

    // 验证必填字段
    if (!oldPassword || !newPassword) {
      return createErrorResponse("旧密码和新密码不能为空", 400);
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      return createErrorResponse("新密码长度至少为6位", 400);
    }

    // 查找用户（需要包含密码字段）
    const user = await User.findById(authResult.userId).select("+passwordHash");

    if (!user) {
      return createErrorResponse("用户不存在", 404);
    }

    // 验证旧密码
    const isOldPasswordValid = await verifyPassword(
      oldPassword,
      user.passwordHash
    );

    if (!isOldPasswordValid) {
      return createErrorResponse("原密码错误", 401);
    }

    // 加密新密码
    const newPasswordHash = await hashPassword(newPassword);

    // 更新密码
    user.passwordHash = newPasswordHash;
    await user.save();

    return createSuccessResponse(null, "密码修改成功");
  } catch (error) {
    console.error("修改密码失败:", error);
    return createErrorResponse("修改密码失败，请稍后重试", 500);
  }
}

