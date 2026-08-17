import { checkIsAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/AdminHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await checkIsAdmin();

  if (!isAdmin) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <main className="px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
