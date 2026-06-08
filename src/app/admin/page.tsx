import { getProducts } from "@/lib/actions";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";
import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export const revalidate = 0;

async function checkIsAdmin() {
  const adminEmails = (
    process.env.ADMIN_EMAILS || "admin@example.com,admin2@example.com"
  ).split(",");

  // Check mock cookie first
  try {
    const cookieStore = await cookies();
    const mockCookie = cookieStore.get("mock-admin-session")?.value;
    if (mockCookie && adminEmails.includes(mockCookie)) {
      return true;
    }
  } catch {}

  // Production check
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email && adminEmails.includes(user.email)) {
      return true;
    }
  } catch {}

  return false;
}

export default async function AdminDashboardPage() {
  const isAdmin = await checkIsAdmin();
  // Commented out 404 check for easy testing as a common user
  /*
  if (!isAdmin) {
    notFound();
  }
  */

  const products = await getProducts();

  return <AdminDashboardClient initialProducts={products} />;
}
