"use client";

import { Button } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Badge } from "@/components/ui/badge";
import { LogOut, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { AppRoutes } from "@/types/enums/routes";

export function AdminHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push(AppRoutes.HOME);
    router.refresh();
  };

  return (
    <Box as="header" className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <Flex align="center" justify="between" className="h-16 px-4 sm:px-6">
        <Flex align="center" gap="xs">
          <Flex align="center" justify="center" className="h-8 w-8 rounded-lg bg-primary">
            <ShoppingBag className="h-4 w-4 text-primary-foreground" />
          </Flex>
          <Box as="span" className="text-sm font-bold text-foreground sm:text-base">
            Al-Rehman Mobile Shop
          </Box>
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
            Admin
          </Badge>
        </Flex>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Exit
        </Button>
      </Flex>
    </Box>
  );
}
