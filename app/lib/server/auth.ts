/**
 * JWT 认证工具
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("请在 .env.local 文件中定义 JWT_SECRET 环境变量");
}

/**
 * JWT Payload 接口
 */
export interface JWTPayload {
  userId: string;
  username: string;
  iat?: number;
  exp?: number;
}

/**
 * 认证结果接口
 */
export interface AuthResult {
  success: boolean;
  userId?: string;
  username?: string;
  error?: string;
}

/**
 * 密码加密
 * @param password 明文密码
 * @returns 加密后的密码哈希
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * 验证密码
 * @param password 明文密码
 * @param hash 密码哈希
 * @returns 是否匹配
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * 生成 JWT Token
 * @param userId 用户ID
 * @param username 用户名
 * @returns JWT Token
 */
export function generateToken(userId: string, username: string): string {
  const payload: JWTPayload = {
    userId,
    username,
  };

  return jwt.sign(payload, JWT_SECRET!, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * 验证 JWT Token
 * @param token JWT Token
 * @returns 解码后的 payload 或 null
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("JWT 验证失败:", error);
    return null;
  }
}

/**
 * 从请求中提取 Bearer Token
 * @param request Next.js 请求对象
 * @returns Token 字符串或 null
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return null;
  }

  // 格式: "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * API 路由认证中间件
 * 从请求中提取并验证 JWT Token
 * @param request Next.js 请求对象
 * @returns 认证结果
 */
export async function authMiddleware(
  request: NextRequest
): Promise<AuthResult> {
  const token = extractTokenFromRequest(request);

  if (!token) {
    return {
      success: false,
      error: "未提供认证令牌",
    };
  }

  const payload = verifyToken(token);

  if (!payload) {
    return {
      success: false,
      error: "无效或过期的认证令牌",
    };
  }

  // 验证 userId 是否为有效的 ObjectId
  if (!mongoose.Types.ObjectId.isValid(payload.userId)) {
    return {
      success: false,
      error: "无效的用户ID",
    };
  }

  return {
    success: true,
    userId: payload.userId,
    username: payload.username,
  };
}

/**
 * 创建统一的认证错误响应
 * @param message 错误消息
 * @param status HTTP 状态码
 * @returns Response 对象
 */
export function createAuthErrorResponse(
  message: string,
  status: number = 401
): Response {
  return Response.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

/**
 * 创建统一的成功响应
 * @param data 响应数据
 * @param message 成功消息
 * @returns Response 对象
 */
export function createSuccessResponse(
  data: unknown,
  message: string = "操作成功"
): Response {
  return Response.json({
    success: true,
    message,
    data,
  });
}

/**
 * 创建统一的错误响应
 * @param message 错误消息
 * @param status HTTP 状态码
 * @returns Response 对象
 */
export function createErrorResponse(
  message: string,
  status: number = 400
): Response {
  return Response.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

