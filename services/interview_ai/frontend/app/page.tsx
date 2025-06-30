"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    // setLocation(`/interview/123`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12" // Increased margin for more spacing
      >
        <img
          src="http://3.216.34.218:8080/dashboard/logo.svg"
          alt="Kifiya Logo"
          className="h-36 mb-12 mx-auto" // Increased height and margin
        />
        <h1 className="text-6xl font-bold mb-4"> {/* Increased text size and margin */}
          Kifiya AI-Interview Platform
        </h1>
        <p className="text-2xl text-muted-foreground"> {/* Increased paragraph size */}
          Experience a next-generation interview powered by artificial
          intelligence.
        </p>
      </motion.div>
    </div>
  );
}
