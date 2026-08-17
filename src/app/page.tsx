import { Navbar } from "@/components/Navbar";
import { HeroBanner } from "@/components/HeroBanner";
import { FeatureBar } from "@/components/FeatureBar";
import { CategoryCards } from "@/components/CategoryCards";
import { Storefront } from "@/components/Storefront";
import { QualityShowcase } from "@/components/QualityShowcase";
import { Footer } from "@/components/Footer";
import { checkIsAdmin } from "@/lib/auth";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Button } from "@/components/ui/button";
import { AppRoutes } from "@/types/enums/routes";
import Link from "next/link";

export const revalidate = 0;

export default async function HomePage() {
  const isAdmin = await checkIsAdmin();

  return (
    <Box className="flex flex-1 flex-col">
      {/* Admin Control Center Banner — visible ONLY to authenticated admins */}
      {isAdmin && (
        <Box className="bg-zinc-950 border-b border-zinc-800 text-white py-2.5 px-4 sm:px-6 z-50">
          <Flex justify="between" align="center" className="mx-auto max-w-7xl flex-col sm:flex-row gap-3">
            <Flex align="center" gap="xs">
              <Box as="span" className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <Box as="span" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Al-Rehman Workspace
              </Box>
              <Box as="span" className="text-xs text-zinc-700">|</Box>
              <Box as="span" className="text-xs text-zinc-300 font-medium">
                Admin Control Center
              </Box>
            </Flex>
            <Flex align="center" gap="xs">
              <Button asChild variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                <Link href={AppRoutes.DASHBOARD}>Dashboard</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={AppRoutes.CREATE_PRODUCT}>+ Add Product</Link>
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}

      <Navbar />
      <HeroBanner />
      <FeatureBar />
      <CategoryCards />

      <Box id="products" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <Storefront />
      </Box>

      <QualityShowcase />
      <Footer />
    </Box>
  );
}
