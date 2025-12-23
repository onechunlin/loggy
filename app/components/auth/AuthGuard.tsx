/**
 * 认证守卫组件
 * 用于保护需要登录才能访问的页面
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/use-auth";

interface AuthGuardProps {
  children: React.ReactNode;
  /** 加载中显示的内容 */
  loadingComponent?: React.ReactNode;
}

export default function AuthGuard({
  children,
  loadingComponent,
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // 如果未登录且不在加载中，跳转到登录页
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // 加载中
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">加载中...</p>
          </div>
        </div>
      )
    );
  }

  // 未登录，不渲染内容（等待跳转）
  if (!isAuthenticated) {
    return null;
  }

  // 已登录，渲染子组件
  return <>{children}</>;
}

