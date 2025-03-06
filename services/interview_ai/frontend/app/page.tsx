"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code2, Shield, ClipboardCheck } from "lucide-react";
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
        className="text-center mb-8"
      >
        <img
          src="https://kifiya.com/wp-content/uploads/2022/12/Logo.svg"
          alt="Kifiya Logo"
          className="h-20 mb-8 mx-auto"
        />
        <h1 className="text-4xl font-bold mb-2">
          Kifiya AI-Interview Platform
        </h1>
        <p className="text-muted-foreground">
          Experience a next-generation interview powered by artificial
          intelligence.
        </p>
      </motion.div>
    </div>
  );
}
