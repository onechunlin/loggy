"use client";

import MainLayout from "@/app/components/layout/MainLayout";
import AuthGuard from "@/app/components/auth/AuthGuard";

export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
}
