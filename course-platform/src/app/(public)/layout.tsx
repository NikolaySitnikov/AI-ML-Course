import { SiteHeader, SiteFooter } from "@/components/public";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col overscroll-none">
      <SiteHeader />
      <main className="flex-1 pt-20 pb-16 overscroll-none">{children}</main>
      <SiteFooter />
    </div>
  );
}
