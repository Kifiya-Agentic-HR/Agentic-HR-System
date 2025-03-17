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
    window.location.href = "/problems/1"; 
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center relative mb-8"
      >
        {/* Logo with Start Button */}
        <div className="relative inline-block">
          <img
            src="https://kifiya.com/wp-content/uploads/2022/12/Logo.svg"
            alt="Kifiya Logo"
            className="h-20 mb-8 mx-auto"
          /> </div>

        <h1 className="text-4xl font-bold mb-2">
          Kifiya Technical Interview Platform
        </h1>
        <p className="text-muted-foreground pb-9">
          Experience a next-generation technical interview powered by artificial intelligence.
        </p>

         {/* Start Button Positioned on the Logo */}
         <button
            onClick={handleStart}
            className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-[#364957] text-white px-5 py-2 rounded-lg transition"
          >
            Start
          </button>
      </motion.div>
    </div>
  );
}
