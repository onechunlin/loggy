/**
 * 用户相关类型定义
 */

/**
 * 用户信息接口
 */
export interface User {
  /** 用户唯一标识 */
  id: string;
  /** 用户账号（用于登录） */
  username: string;
  /** 用户昵称 */
  nickname: string;
  /** 用户邮箱 */
  email?: string;
  /** 用户头像URL */
  avatar?: string;
  /** 创建时间 */
  createdAt: string;
  /** 最后登录时间 */
  lastLoginAt?: string;
}

/**
 * 用户凭证接口（包含密码）
 */
export interface UserCredential extends User {
  /** 加密后的密码 */
  passwordHash: string;
}

/**
 * 登录表单数据
 */
export interface LoginForm {
  /** 用户账号 */
  username: string;
  /** 密码 */
  password: string;
  /** 是否记住登录状态 */
  rememberMe?: boolean;
}

/**
 * 注册表单数据
 */
export interface RegisterForm {
  /** 用户账号 */
  username: string;
  /** 用户昵称 */
  nickname: string;
  /** 密码 */
  password: string;
  /** 确认密码 */
  confirmPassword: string;
  /** 用户邮箱 */
  email?: string;
}

/**
 * 认证状态
 */
export interface AuthState {
  /** 是否已登录 */
  isAuthenticated: boolean;
  /** 当前用户信息 */
  user: User | null;
  /** 认证令牌 */
  token: string | null;
}

