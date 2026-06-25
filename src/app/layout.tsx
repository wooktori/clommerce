import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import Header from "@/components/layout/Header";
import CartDrawer from "@/components/cart/CartDrawer";

const lato = Lato({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clommerce",
  description: "결제 커머스 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={lato.variable}>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <AuthProvider>
            <Header />
            {children}
            <CartDrawer />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
