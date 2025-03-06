"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import KifiyaLogo from "@/components/kifiya-logo";
import { Button } from "@/components/ui/button";

export function MainNav() {
  return (
    <nav className="container h-24 flex items-center justify-between px-6 py-4 bg-transparent drop-shadow-3xl rounded-lg border-b-2 border-gray-300 ">
     
      <motion.div
        whileHover={{ scale: 0.96 }}
        className="flex items-center gap-3 self-center"
      >
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-1 rounded-lg transition-colors">
            <KifiyaLogo className="h-18 w-32" />
          </div>
        </Link>
      </motion.div>

     
      <Link href="/">
        <Button
          className="bg-secondary text-white w-15 h-15 rounded-full flex items-center justify-center text-sm font-semibold"
          style={{ backgroundColor: "#364957" }} 
        >
          Explore More jobs
        </Button>
      </Link>
    </nav>
  );
}
