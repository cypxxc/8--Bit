import type { Metadata } from "next";
import "./admin.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "8bit • หลังบ้าน",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-shell">{children}</div>;
}
