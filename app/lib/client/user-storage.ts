/**
 * 用户数据存储服务
 * 使用 localStorage 存储用户信息和认证状态
 */

import { User, UserCredential, AuthState } from "@/app/types/user";

const STORAGE_KEYS = {
  USERS: "loggy_users",
  CURRENT_USER: "loggy_current_user",
  AUTH_TOKEN: "loggy_auth_token",
} as const;

/**
 * 简单的密码哈希函数（实际项目中应使用更安全的加密方式）
 * 注意：这只是演示用途，生产环境应该使用后端加密
 */
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 获取所有用户（包含密码哈希）
 */
function getAllUsers(): UserCredential[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
}

/**
 * 保存所有用户
 */
function saveAllUsers(users: UserCredential[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

/**
 * 用户存储服务类
 */
export class UserStorage {
  /**
   * 注册新用户
   */
  static register(
    username: string,
    password: string,
    nickname: string,
    email?: string
  ): { success: boolean; message: string; user?: User } {
    const users = getAllUsers();

    // 检查用户名是否已存在
    if (users.some((u) => u.username === username)) {
      return { success: false, message: "用户名已存在" };
    }

    // 创建新用户
    const newUser: UserCredential = {
      id: generateId(),
      username,
      nickname,
      email,
      passwordHash: simpleHash(password),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveAllUsers(users);

    // 返回不包含密码的用户信息
    const { passwordHash, ...userWithoutPassword } = newUser;
    return {
      success: true,
      message: "注册成功",
      user: userWithoutPassword,
    };
  }

  /**
   * 用户登录
   */
  static login(
    username: string,
    password: string
  ): { success: boolean; message: string; user?: User; token?: string } {
    const users = getAllUsers();
    const user = users.find((u) => u.username === username);

    if (!user) {
      return { success: false, message: "用户名不存在" };
    }

    if (user.passwordHash !== simpleHash(password)) {
      return { success: false, message: "密码错误" };
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date().toISOString();
    saveAllUsers(users);

    // 生成简单的认证令牌
    const token = generateId();

    // 保存当前用户和令牌
    const { passwordHash, ...userWithoutPassword } = user;
    this.setCurrentUser(userWithoutPassword, token);

    return {
      success: true,
      message: "登录成功",
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * 用户登出
   */
  static logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * 获取当前登录用户
   */
  static getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  }

  /**
   * 获取认证令牌
   */
  static getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * 设置当前用户
   */
  static setCurrentUser(user: User, token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  /**
   * 检查是否已登录
   */
  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null && this.getAuthToken() !== null;
  }

  /**
   * 获取认证状态
   */
  static getAuthState(): AuthState {
    return {
      isAuthenticated: this.isAuthenticated(),
      user: this.getCurrentUser(),
      token: this.getAuthToken(),
    };
  }

  /**
   * 更新用户信息
   */
  static updateUser(
    userId: string,
    updates: Partial<Omit<User, "id" | "username">>
  ): { success: boolean; message: string; user?: User } {
    const users = getAllUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return { success: false, message: "用户不存在" };
    }

    // 更新用户信息
    users[userIndex] = { ...users[userIndex], ...updates };
    saveAllUsers(users);

    // 如果更新的是当前用户，也更新当前用户缓存
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const { passwordHash, ...userWithoutPassword } = users[userIndex];
      const token = this.getAuthToken();
      if (token) {
        this.setCurrentUser(userWithoutPassword, token);
      }
    }

    const { passwordHash, ...userWithoutPassword } = users[userIndex];
    return {
      success: true,
      message: "更新成功",
      user: userWithoutPassword,
    };
  }

  /**
   * 修改密码
   */
  static changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): { success: boolean; message: string } {
    const users = getAllUsers();
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return { success: false, message: "用户不存在" };
    }

    if (user.passwordHash !== simpleHash(oldPassword)) {
      return { success: false, message: "原密码错误" };
    }

    user.passwordHash = simpleHash(newPassword);
    saveAllUsers(users);

    return { success: true, message: "密码修改成功" };
  }

  /**
   * 删除用户（管理功能）
   */
  static deleteUser(userId: string): { success: boolean; message: string } {
    const users = getAllUsers();
    const filteredUsers = users.filter((u) => u.id !== userId);

    if (users.length === filteredUsers.length) {
      return { success: false, message: "用户不存在" };
    }

    saveAllUsers(filteredUsers);

    // 如果删除的是当前用户，则登出
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      this.logout();
    }

    return { success: true, message: "用户删除成功" };
  }

  /**
   * 获取所有用户（不包含密码）
   */
  static getAllUsersWithoutPassword(): User[] {
    const users = getAllUsers();
    return users.map(({ passwordHash, ...user }) => user);
  }
}

