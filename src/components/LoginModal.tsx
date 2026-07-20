"use client";

import { useLoginModal } from "@/core/loginModal/useLoginModal";
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
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Loader2 } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const {
    email,
    password,
    error,
    loading,
    isPlaceholderSupabase,
    setEmail,
    setPassword,
    handleLogin,
  } = useLoginModal(onOpenChange);

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
            <Box className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
              {error}
            </Box>
          )}

          <Box className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </Box>

          <Box className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              required={!isPlaceholderSupabase}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Box>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Flex align="center" justify="center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </Flex>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
