/**
 * 认证相关 Hook（使用 MongoDB + JWT）
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { User, AuthState, LoginForm, RegisterForm } from "@/app/types/user";
import {
  apiClient,
  saveAuthToken,
  clearAuthToken,
  isOnline,
} from "@/app/lib/client";
import { UserStorage } from "@/app/lib/client/user-storage";

const AUTH_USER_KEY = "loggy_current_user";

/**
 * 从 localStorage 获取缓存的用户信息
 */
function getCachedUser(): User | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(AUTH_USER_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * 缓存用户信息到 localStorage
 */
function setCachedUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

/**
 * 清除缓存的用户信息
 */
function clearCachedUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_USER_KEY);
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时检查登录状态
  useEffect(() => {
    const initAuth = async () => {
      const cachedUser = getCachedUser();
      const token = localStorage.getItem("loggy_auth_token");

      if (cachedUser && token) {
        // 如果有缓存，先使用缓存
        setAuthState({
          isAuthenticated: true,
          user: cachedUser,
          token,
        });

        // 如果在线，尝试从服务器获取最新信息
        if (isOnline()) {
          try {
            const user = await apiClient.get<User>("/api/auth/me");
            setAuthState({
              isAuthenticated: true,
              user,
              token,
            });
            setCachedUser(user);
          } catch (error) {
            console.error("获取用户信息失败:", error);
            // 继续使用缓存的用户信息
          }
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // 登录
  const login = useCallback(
    async (
      loginForm: LoginForm
    ): Promise<{ success: boolean; message: string }> => {
      try {
        // 如果在线，调用 API
        if (isOnline()) {
          const response = await apiClient.post<{
            user: User;
            token: string;
          }>(
            "/api/auth/login",
            {
              username: loginForm.username,
              password: loginForm.password,
            },
            { requireAuth: false }
          );

          // 保存 token
          saveAuthToken(response.token);

          // 缓存用户信息
          setCachedUser(response.user);

          setAuthState({
            isAuthenticated: true,
            user: response.user,
            token: response.token,
          });

          return { success: true, message: "登录成功" };
        } else {
          // 离线时使用本地存储
          const result = UserStorage.login(
            loginForm.username,
            loginForm.password
          );

          if (result.success && result.user && result.token) {
            setAuthState({
              isAuthenticated: true,
              user: result.user,
              token: result.token,
            });
          }

          return { success: result.success, message: result.message };
        }
      } catch (error: unknown) {
        console.error("登录失败:", error);

        // API 失败时尝试使用本地存储
        const result = UserStorage.login(
          loginForm.username,
          loginForm.password
        );

        if (result.success && result.user && result.token) {
          setAuthState({
            isAuthenticated: true,
            user: result.user,
            token: result.token,
          });
        }

        return {
          success: result.success,
          message: error instanceof Error ? error.message : result.message,
        };
      }
    },
    []
  );

  // 注册
  const register = useCallback(
    async (
      registerForm: RegisterForm
    ): Promise<{ success: boolean; message: string }> => {
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

      try {
        // 如果在线，调用 API
        if (isOnline()) {
          const response = await apiClient.post<{
            user: User;
            token: string;
          }>(
            "/api/auth/register",
            {
              username: registerForm.username,
              password: registerForm.password,
              nickname: registerForm.nickname,
              email: registerForm.email,
              registrationCode: registerForm.registrationCode,
            },
            { requireAuth: false }
          );

          // 保存 token
          saveAuthToken(response.token);

          // 缓存用户信息
          setCachedUser(response.user);

          setAuthState({
            isAuthenticated: true,
            user: response.user,
            token: response.token,
          });

          return { success: true, message: "注册成功" };
        } else {
          // 离线时使用本地存储
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
        }
      } catch (error: unknown) {
        console.error("注册失败:", error);

        // 如果是 ApiError，直接返回错误信息，不使用本地存储
        if (error && typeof error === "object" && "message" in error) {
          return {
            success: false,
            message: (error as Error).message,
          };
        }

        return {
          success: false,
          message: "注册失败，请稍后重试",
        };
      }
    },
    []
  );

  // 登出
  const logout = useCallback(() => {
    clearAuthToken();
    clearCachedUser();
    UserStorage.logout();

    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  }, []);

  // 更新用户信息
  const updateUser = useCallback(
    async (
      updates: Partial<Omit<User, "id" | "username">>
    ): Promise<{
      success: boolean;
      message: string;
    }> => {
      if (!authState.user) {
        return { success: false, message: "用户未登录" };
      }

      try {
        // 如果在线，调用 API
        if (isOnline()) {
          const user = await apiClient.patch<User>(
            "/api/auth/profile",
            updates
          );

          // 更新缓存
          setCachedUser(user);

          setAuthState((prev) => ({
            ...prev,
            user,
          }));

          // 同步到本地存储
          UserStorage.updateUser(authState.user.id, updates);

          return { success: true, message: "更新成功" };
        } else {
          // 离线时使用本地存储
          const result = UserStorage.updateUser(authState.user.id, updates);

          if (result.success && result.user) {
            setAuthState((prev) => ({
              ...prev,
              user: result.user!,
            }));
            setCachedUser(result.user);
          }

          return { success: result.success, message: result.message };
        }
      } catch (error: unknown) {
        console.error("更新用户信息失败:", error);

        // API 失败时尝试使用本地存储
        const result = UserStorage.updateUser(authState.user.id, updates);

        if (result.success && result.user) {
          setAuthState((prev) => ({
            ...prev,
            user: result.user!,
          }));
          setCachedUser(result.user);
        }

        return {
          success: result.success,
          message: error instanceof Error ? error.message : result.message,
        };
      }
    },
    [authState.user]
  );

  // 修改密码
  const changePassword = useCallback(
    async (
      oldPassword: string,
      newPassword: string
    ): Promise<{
      success: boolean;
      message: string;
    }> => {
      if (!authState.user) {
        return { success: false, message: "用户未登录" };
      }

      if (newPassword.length < 6) {
        return { success: false, message: "新密码长度至少为6位" };
      }

      try {
        // 如果在线，调用 API
        if (isOnline()) {
          await apiClient.patch("/api/auth/password", {
            oldPassword,
            newPassword,
          });

          // 同步到本地存储
          UserStorage.changePassword(
            authState.user.id,
            oldPassword,
            newPassword
          );

          return { success: true, message: "密码修改成功" };
        } else {
          // 离线时使用本地存储
          return UserStorage.changePassword(
            authState.user.id,
            oldPassword,
            newPassword
          );
        }
      } catch (error: unknown) {
        console.error("修改密码失败:", error);

        // API 失败时尝试使用本地存储
        return UserStorage.changePassword(
          authState.user.id,
          oldPassword,
          newPassword
        );
      }
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
