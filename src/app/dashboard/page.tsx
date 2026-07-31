import { getProducts } from "@/lib/actions";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";
// import { createClient } from "@/utils/supabase/server"; // commented for local dev
// import { cookies } from "next/headers"; // commented for local dev
// import { notFound } from "next/navigation"; // commented for local dev

export const revalidate = 0;

// Admin check commented for local dev
// async function checkIsAdmin() { ... }

export default async function AdminDashboardPage() {
  // const isAdmin = await checkIsAdmin();
  // if (!isAdmin) { notFound(); }

  const products = await getProducts();
  return <AdminDashboardClient initialProducts={products} />;
}
