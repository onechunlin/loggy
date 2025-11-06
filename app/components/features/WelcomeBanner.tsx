"use client";

import { useTyped } from "@/app/hooks/use-typed";

/**
 * 欢迎标语组件
 */
export default function WelcomeBanner() {
  const typedRef = useTyped();

  return (
    <div className="text-center">
      <h1 className="text-2xl font-medium text-gray-800 mb-2">
        <span ref={typedRef}></span>
      </h1>
      <p className="text-gray-500 text-sm">智能助手，随时为您提供帮助</p>
    </div>
  );
}
