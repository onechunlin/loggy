import MainLayout from "@/app/components/layout/MainLayout";

export default function AssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
