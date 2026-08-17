import Link from "next/link";
import { AlertCircle, Home } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Heading } from "@/components/ui/heading";
import { Paragraph } from "@/components/ui/paragraph";
import { Button } from "@/components/ui/button";
import { AppRoutes } from "@/types/enums/routes";

export default function NotFound() {
  return (
    <Box className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 text-center font-sans">
      {/* Background radial glow using pure Tailwind background utilities (no inline style object) */}
      <Box aria-hidden className="pointer-events-none absolute inset-0 z-0 bg-radial-gradient-danger opacity-40" />

      <Box className="relative z-10 mx-auto max-w-md rounded-2xl border bg-card p-8 shadow-xl backdrop-blur-md sm:p-10">
        <Flex justify="center" align="center" className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle size={32} />
        </Flex>

        <Box as="span" className="mb-2 inline-block rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-destructive">
          404 Error
        </Box>

        <Heading level="h1" className="mb-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Page Not Present
        </Heading>

        <Paragraph className="mb-8 text-sm leading-relaxed text-muted-foreground">
          This page is not present or you do not have permission to access it. Only authorized administrators can view this area.
        </Paragraph>

        <Flex justify="center" align="center" className="gap-3">
          <Button asChild className="w-full sm:w-auto gap-2">
            <Link href={AppRoutes.HOME}>
              <Home size={18} />
              Back to Storefront
            </Link>
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
