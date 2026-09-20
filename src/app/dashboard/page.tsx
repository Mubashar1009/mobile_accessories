import { getProducts } from "@/app/actions/product.actions";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";
import { checkIsAdmin } from "@/lib/authz";
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
