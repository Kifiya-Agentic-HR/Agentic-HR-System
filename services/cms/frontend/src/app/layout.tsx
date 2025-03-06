import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HR Admin System",
  description: "AI-Powered HR Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-background antialiased">
        <div className="flex">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
