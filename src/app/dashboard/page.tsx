import { getProducts } from "@/lib/actions";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";
import { checkIsAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    notFound();
  }

  const products = await getProducts();
  return <AdminDashboardClient initialProducts={products} />;
}
