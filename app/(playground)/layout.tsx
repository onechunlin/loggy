import { SecondaryLayout } from "@/app/components/layout";

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SecondaryLayout>{children}</SecondaryLayout>;
}
