/**
 * MongoDB 连接管理
 * 使用单例模式避免热重载时重复连接
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("请在 .env.local 文件中定义 MONGODB_URI 环境变量");
}

/**
 * 全局缓存的 mongoose 连接
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// 使用全局变量缓存连接，避免热重载时重复连接
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * 连接到 MongoDB
 * @returns mongoose 实例
 */
export async function connectDB(): Promise<typeof mongoose> {
  // 如果已经有连接，直接返回
  if (cached.conn) {
    return cached.conn;
  }

  // 如果没有 promise，创建一个新的连接 promise
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // 最大连接池大小
      minPoolSize: 2, // 最小连接池大小
      serverSelectionTimeoutMS: 5000, // 服务器选择超时
      socketTimeoutMS: 45000, // Socket 超时
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log("✅ MongoDB 连接成功");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB 连接失败:", error);
    throw error;
  }

  return cached.conn;
}

/**
 * 断开 MongoDB 连接（通常不需要手动调用）
 */
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log("🔌 MongoDB 连接已断开");
  }
}

/**
 * 获取连接状态
 */
export function getConnectionStatus(): string {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return (
    states[mongoose.connection.readyState as keyof typeof states] || "unknown"
  );
}
