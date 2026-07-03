import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ProductProvider } from "@/components/ProductProvider";
import { CartProvider } from "@/components/CartProvider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#171717",
};

export const metadata: Metadata = {
  title: "Al-Rehman Mobile Shop — Smart Wearables & Tech Accessories",
  description:
    "Premium audio, power, and smart devices. Order directly via WhatsApp.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Al-Rehman" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ProductProvider>
          <CartProvider>{children}</CartProvider>
        </ProductProvider>
        <script
          dangerouslySetInnerHTML={{
            __html:
              process.env.NODE_ENV === "production"
                ? `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(()=>{});})}`
                : `if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(regs){for(let reg of regs){reg.unregister();}}).catch(()=>{});}if('caches' in window){caches.keys().then(function(names){for(let name of names){caches.delete(name);}}).catch(()=>{});}`,
          }}
        />
      </body>
    </html>
  );
}
