/**
 * 认证相关 Hook
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { User, AuthState, LoginForm, RegisterForm } from "@/app/types/user";
import { UserStorage } from "@/app/lib/client/user-storage";

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时检查登录状态
  useEffect(() => {
    const state = UserStorage.getAuthState();
    setAuthState(state);
    setIsLoading(false);
  }, []);

  // 登录
  const login = useCallback(
    (loginForm: LoginForm): { success: boolean; message: string } => {
      const result = UserStorage.login(loginForm.username, loginForm.password);

      if (result.success && result.user && result.token) {
        setAuthState({
          isAuthenticated: true,
          user: result.user,
          token: result.token,
        });
      }

      return { success: result.success, message: result.message };
    },
    []
  );

  // 注册
  const register = useCallback(
    (registerForm: RegisterForm): { success: boolean; message: string } => {
      // 验证密码是否一致
      if (registerForm.password !== registerForm.confirmPassword) {
        return { success: false, message: "两次输入的密码不一致" };
      }

      // 验证密码长度
      if (registerForm.password.length < 6) {
        return { success: false, message: "密码长度至少为6位" };
      }

      // 验证用户名长度
      if (registerForm.username.length < 3) {
        return { success: false, message: "用户名长度至少为3位" };
      }

      const result = UserStorage.register(
        registerForm.username,
        registerForm.password,
        registerForm.nickname,
        registerForm.email
      );

      if (result.success && result.user) {
        // 注册成功后自动登录
        const loginResult = UserStorage.login(
          registerForm.username,
          registerForm.password
        );
        if (loginResult.success && loginResult.user && loginResult.token) {
          setAuthState({
            isAuthenticated: true,
            user: loginResult.user,
            token: loginResult.token,
          });
        }
      }

      return { success: result.success, message: result.message };
    },
    []
  );

  // 登出
  const logout = useCallback(() => {
    UserStorage.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  }, []);

  // 更新用户信息
  const updateUser = useCallback(
    (updates: Partial<Omit<User, "id" | "username">>): {
      success: boolean;
      message: string;
    } => {
      if (!authState.user) {
        return { success: false, message: "用户未登录" };
      }

      const result = UserStorage.updateUser(authState.user.id, updates);

      if (result.success && result.user) {
        setAuthState((prev) => ({
          ...prev,
          user: result.user!,
        }));
      }

      return { success: result.success, message: result.message };
    },
    [authState.user]
  );

  // 修改密码
  const changePassword = useCallback(
    (oldPassword: string, newPassword: string): {
      success: boolean;
      message: string;
    } => {
      if (!authState.user) {
        return { success: false, message: "用户未登录" };
      }

      if (newPassword.length < 6) {
        return { success: false, message: "新密码长度至少为6位" };
      }

      return UserStorage.changePassword(
        authState.user.id,
        oldPassword,
        newPassword
      );
    },
    [authState.user]
  );

  return {
    ...authState,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    changePassword,
  };
}

