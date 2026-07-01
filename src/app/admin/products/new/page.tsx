// import { createClient } from "@/utils/supabase/server"; // commented for local dev
// import { cookies } from "next/headers"; // commented for local dev
// import { notFound } from "next/navigation"; // commented for local dev
import { AdminProductForm } from "@/components/AdminProductForm";

export const revalidate = 0;

// Admin check commented out for local dev
// async function checkIsAdmin() { ... }

export default async function NewProductPage() {
  // const isAdmin = await checkIsAdmin();
  // if (!isAdmin) { notFound(); }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Create New Product</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill in the details below to add a new product to the store catalog.
        </p>
      </div>
      <div className="rounded-lg border bg-background p-6 shadow-sm">
        <AdminProductForm />
      </div>
    </div>
  );
}
