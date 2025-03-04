import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { MainNav } from "@/components/main-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kifiya Careers",
  description: "Career portal for Kifiya Financial Technologies 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
     <head> 
     <link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet"/>
      </head>
      <body className={cn("min-h-screen bg-background antialiased", inter.className)}>
        {/* <div className="flex flex-col min-h-screen rounded-lg"> */}
          <header className="bg-white pt-4 text-white sticky top-0 z-50">
            {/* <div className="container flex  items-center justify-between bg-white">  */}
              {/* div1 */}
              <MainNav />
            {/* </div> */}
          </header>
          
          <main className="flex-1 container mt-10 rounded-lg py-8">{children}</main>

        {/* </div> */}
      </body>
    </html>
  );
}