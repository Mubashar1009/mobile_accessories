import { Navbar } from "@/components/Navbar";
import { HeroBanner } from "@/components/HeroBanner";
import { FeatureBar } from "@/components/FeatureBar";
import { CategoryCards } from "@/components/CategoryCards";
import { Storefront } from "@/components/Storefront";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
// import { createClient } from "@/utils/supabase/server"; // commented for local dev
// import { cookies } from "next/headers"; // commented for local dev
import Link from "next/link";

export const revalidate = 0;

export default async function HomePage() {
  // Admin check commented for local dev — always show admin bar
  // const isAdmin = await checkIsAdmin();
  const isAdmin = true;

  return (
    <div className="flex flex-1 flex-col">
      {/* Admin Control Center Banner */}
      {isAdmin && (
        <div className="bg-zinc-950 border-b border-zinc-800 text-white py-2.5 px-4 sm:px-6 z-50">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Rehvox Workspace
              </span>
              <span className="text-xs text-zinc-700">|</span>
              <span className="text-xs text-zinc-300 font-medium">Admin Control Center</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href="/admin"
                className="rounded bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border border-zinc-800"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/products/new"
                className="rounded bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm"
              >
                + Add Product
              </Link>
            </div>
          </div>
        </div>
      )}

      <Navbar />
      <HeroBanner />
      <FeatureBar />
      <CategoryCards />

      <section id="products" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <Storefront />
      </section>

      <Testimonials />
      <Footer />
    </div>
  );
}
