"use client";

import { useRouter } from "next/navigation";
// import { createClient } from "@/utils/supabase/client"; // commented for local dev
import { Button } from "@/components/ui/button";
import { LogOut, ShoppingBag } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    // Supabase sign-out commented for local dev
    // const supabase = createClient();
    // await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <ShoppingBag className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground sm:text-base">Al-Rehman Mobile Shop</span>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Admin</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Exit
          </Button>
        </div>
      </header>
      <main className="px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
