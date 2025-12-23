/**
 * 用户注册 API
 * POST /api/auth/register
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/app/lib/server/mongodb";
import { User } from "@/app/lib/server/models";
import {
  hashPassword,
  generateToken,
  createSuccessResponse,
  createErrorResponse,
} from "@/app/lib/server/auth";

export async function POST(request: NextRequest) {
  try {
    // 连接数据库
    await connectDB();

    // 解析请求体
    const body = await request.json();
    const { username, password, nickname, email, registrationCode } = body;

    // 验证注册码
    const requiredRegistrationCode = process.env.REGISTRATION_SECRET;
    if (
      requiredRegistrationCode &&
      registrationCode !== requiredRegistrationCode
    ) {
      return createErrorResponse("注册码错误，请联系管理员获取注册码", 403);
    }

    // 验证必填字段
    if (!username || !password || !nickname) {
      return createErrorResponse("用户名、密码和昵称不能为空", 400);
    }

    // 验证用户名长度
    if (username.length < 3) {
      return createErrorResponse("用户名长度至少为3位", 400);
    }

    // 验证密码长度
    if (password.length < 6) {
      return createErrorResponse("密码长度至少为6位", 400);
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return createErrorResponse("用户名已存在", 409);
    }

    // 如果提供了邮箱，检查是否已存在
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return createErrorResponse("邮箱已被使用", 409);
      }
    }

    // 加密密码
    const passwordHash = await hashPassword(password);

    // 创建用户
    const user = await User.create({
      username,
      nickname,
      email: email || undefined,
      passwordHash,
    });

    // 生成 JWT Token
    const token = generateToken(user._id.toString(), user.username);

    // 返回用户信息（不包含密码）
    const userResponse = {
      id: user._id.toString(),
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
    };

    return createSuccessResponse(
      {
        user: userResponse,
        token,
      },
      "注册成功"
    );
  } catch (error: unknown) {
    console.error("注册失败:", error);

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

    return createErrorResponse("注册失败，请稍后重试", 500);
  }
}
