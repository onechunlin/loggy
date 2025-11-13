import { NextResponse } from "next/server";

/**
 * GET /api/demo/user-info
 * 模拟用户信息接口
 *
 * 注意：userInfo 字段是可选的，可能不存在
 * 前端如果直接访问 userInfo.profile.name 会导致错误
 */
export async function GET() {
  // 模拟后端返回数据，userInfo 字段是可选的
  // 有时候返回，有时候不返回（模拟协议不对齐的情况）
  const shouldReturnUserInfo = Math.random() > 0.9;

  const response = {
    success: true,
    message: "获取用户信息成功",
    // userInfo 是可选字段，前端误认为是必传的
    ...(shouldReturnUserInfo
      ? {
          userInfo: {
            profile: {
              name: "张三",
              age: 25,
              email: "zhangsan@example.com",
            },
            settings: {
              theme: "dark",
              language: "zh-CN",
            },
          },
        }
      : {}),
    // 其他字段
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
