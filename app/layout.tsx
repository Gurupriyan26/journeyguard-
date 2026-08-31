import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PWAInstallBanner from "@/components/common/PWAInstallBanner";
import MobileBottomNav from "@/components/common/MobileBottomNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "JourneyGuard — Safe Mobile Journey Tracking & Guardian Alert Platform",
  description:
    "Travel peacefully. Consent-based, temporary journey tracking that automatically alerts loved ones as you approach your destination.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JourneyGuard",
  },
  applicationName: "JourneyGuard",
  formatDetection: {
    telephone: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full min-h-dvh flex flex-col bg-[#030712] text-slate-100 font-sans pb-16 sm:pb-0" suppressHydrationWarning>
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        
        {/* Mobile PWA Smart Installation Banner (Android & iOS) */}
        <PWAInstallBanner />

        {/* Native Mobile Bottom Navigation Bar */}
        <MobileBottomNav />
      </body>
    </html>
  );
}
