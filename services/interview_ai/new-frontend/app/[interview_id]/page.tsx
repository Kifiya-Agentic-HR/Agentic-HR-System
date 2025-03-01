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

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-semibold text-center"
          >
            Ready to Begin?
          </motion.h2>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <motion.div
              variants={item}
              className="flex flex-col items-center text-center p-4"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"
              >
                <Code2 className="h-6 w-6 text-[#364957]" />
              </motion.div>
              <h3 className="font-medium mb-2 text-[#364957]">
                Personalized Assessment
              </h3>
              <p className="text-sm text-muted-foreground">
                AI-powered assessment
              </p>
            </motion.div>

            <motion.div
              variants={item}
              className="flex flex-col items-center text-center space-y-2 p-4"
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="h-12 w-12 rounded-full bg-[#FF8A00]/10 flex items-center justify-center mb-4"
              >
                <Shield className="h-6 w-6 text-[#FF8A00]" />
              </motion.div>
              <h3 className="font-medium mb-2 text-[#364957]">
                Secure Environment
              </h3>
              <p className="text-sm text-muted-foreground text-gray-600">
                Anti-cheating measures
              </p>
            </motion.div>

            <motion.div
              variants={item}
              className="flex flex-col items-center text-center p-4"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"
              >
                <div className="p-3 rounded-full bg-green-100">
                  <ClipboardCheck className="h-6 w-6 text-green-600" />
                </div>
              </motion.div>
              <h3 className="font-medium mb-2 text-[#364957]">
                Fair Evaluation
              </h3>
              <p className="text-sm text-muted-foreground text-gray-600">
                Equal opportunity assessment
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              className="w-full bg-[#364957] hover:bg-[#364957]/90 text-white text-lg py-6"
              size="lg"
              onClick={handleStart}
              disabled={loading}
            >
              {loading ? (
                <motion.div
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span>Preparing Your Interview...</span>
                </motion.div>
              ) : (
                "Start Virtual Interview"
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
