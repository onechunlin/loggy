import MainLayout from "@/app/components/layout/MainLayout";

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout showTabBar={false}>{children}</MainLayout>;
}
