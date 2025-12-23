/**
 * API 客户端封装
 * 统一的 API 调用工具，支持认证、错误处理
 */

"use client";

/**
 * API 响应接口
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * API 错误类
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * 获取认证令牌
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("loggy_auth_token");
}

/**
 * 保存认证令牌
 */
export function saveAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("loggy_auth_token", token);
}

/**
 * 清除认证令牌
 */
export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("loggy_auth_token");
}

/**
 * API 请求配置
 */
interface RequestConfig extends RequestInit {
  requireAuth?: boolean; // 是否需要认证
}

/**
 * 统一的 API 请求函数
 */
async function request<T = unknown>(
  url: string,
  config: RequestConfig = {}
): Promise<T> {
  const { requireAuth = true, headers = {}, ...restConfig } = config;

  // 构建请求头
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  // 添加认证令牌
  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  // 发送请求
  try {
    const response = await fetch(url, {
      ...restConfig,
      headers: requestHeaders,
    });

    // 解析响应
    const data: ApiResponse<T> = await response.json();

    // 检查响应状态
    if (!response.ok) {
      throw new ApiError(data.message || "请求失败", response.status, data);
    }

    // 检查业务状态
    if (!data.success) {
      throw new ApiError(data.message || "操作失败", response.status, data);
    }

    return data.data as T;
  } catch (error) {
    // 网络错误
    if (error instanceof TypeError) {
      throw new ApiError("网络连接失败，请检查网络设置", 0);
    }

    // API 错误
    if (error instanceof ApiError) {
      throw error;
    }

    // 其他错误
    throw new ApiError("未知错误", 500, error);
  }
}

/**
 * API 客户端
 */
export const apiClient = {
  /**
   * GET 请求
   */
  get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return request<T>(url, { ...config, method: "GET" });
  },

  /**
   * POST 请求
   */
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return request<T>(url, {
      ...config,
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * PATCH 请求
   */
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return request<T>(url, {
      ...config,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE 请求
   */
  delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return request<T>(url, { ...config, method: "DELETE" });
  },
};

/**
 * 判断是否在线
 */
export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}
