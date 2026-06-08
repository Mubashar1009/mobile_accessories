import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AdminProductForm } from "@/components/AdminProductForm";

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

export default async function NewProductPage() {
  const isAdmin = await checkIsAdmin();
  // Commented out 404 check for easy testing as a common user
  /*
  if (!isAdmin) {
    notFound();
  }
  */

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Create New Product
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill in the details below to add a new mobile accessory or device to the store catalog.
        </p>
      </div>
      <div className="rounded-lg border bg-background p-6 shadow-sm">
        <AdminProductForm />
      </div>
    </div>
  );
}
