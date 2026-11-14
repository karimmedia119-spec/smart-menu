import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import { AuthProvider } from "../context/AuthContext";

export const metadata: Metadata = {
  title: "Smart Menu | المنظومة السحابية المتكاملة للطلب وإدارة المنشآت",
  description: "نظام SaaS متكامل للطلب اللحظي بين الصالة ومحطة التجهيز والكاشير بتصميم دافئ فاخر.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAF8F5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-warm-bg text-warm-text min-h-screen selection:bg-warm-accent selection:text-white antialiased">
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
