"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// import { createClient } from "@/utils/supabase/client"; // commented for local dev
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isPlaceholderSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    return !url || url.includes("your-project-id") || url === "https://.supabase.co";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const adminEmails = (
        process.env.NEXT_PUBLIC_ADMIN_EMAILS || "admin@example.com,admin2@example.com"
      ).split(",");

      if (isPlaceholderSupabase()) {
        // Mock offline fallback mode: check if it's one of the admin emails
        if (adminEmails.includes(email.trim())) {
          // Set a mock cookie for development testing
          document.cookie = `mock-admin-session=${encodeURIComponent(
            email.trim()
          )}; path=/; max-age=86400`;
          
          onOpenChange(false);
          router.refresh();
          return;
        } else {
          setError("Access denied: You are not authorized as an administrator.");
          setLoading(false);
          return;
        }
      }

      // Production Supabase auth commented for local dev
      /*
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) { setError(authError.message); setLoading(false); return; }
      const userEmail = data.user?.email;
      if (!userEmail || !adminEmails.includes(userEmail)) {
        await supabase.auth.signOut();
        setError("Access denied: You are not authorized as an administrator.");
        setLoading(false); return;
      }
      */

      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Admin Portal</DialogTitle>
          <DialogDescription>
            Authenticate to access the admin workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              required={!isPlaceholderSupabase()}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
