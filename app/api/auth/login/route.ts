/**
 * 用户登录 API
 * POST /api/auth/login
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/app/lib/server/mongodb";
import { User } from "@/app/lib/server/models";
import {
  verifyPassword,
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
    const { username, password } = body;

    // 验证必填字段
    if (!username || !password) {
      return createErrorResponse("用户名和密码不能为空", 400);
    }

    // 查找用户（需要包含密码字段）
    const user = await User.findOne({ username }).select("+passwordHash");

    if (!user) {
      return createErrorResponse("用户名或密码错误", 401);
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return createErrorResponse("用户名或密码错误", 401);
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

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
      lastLoginAt: user.lastLoginAt.toISOString(),
    };

    return createSuccessResponse(
      {
        user: userResponse,
        token,
      },
      "登录成功"
    );
  } catch (error) {
    console.error("登录失败:", error);
    return createErrorResponse("登录失败，请稍后重试", 500);
  }
}
