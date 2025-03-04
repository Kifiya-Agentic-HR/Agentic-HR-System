"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code2, Shield, ClipboardCheck, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getInterview } from "@/lib/api";

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

interface StatusConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const statusConfig: Record<string, StatusConfig> = {
  completed: {
    title: "Interview Completed",
    description: "This interview session has been successfully completed. Please check your email for further updates.",
    icon: <CheckCircle2 className="h-12 w-12 text-green-600" />,
    color: "bg-green-100",
  },
  expired: {
    title: "Interview Expired",
    description: "This interview link has expired. Please contact your recruiter for a new interview invitation.",
    icon: <Clock className="h-12 w-12 text-orange-600" />,
    color: "bg-orange-100",
  },
  flagged: {
    title: "Interview Flagged",
    description: "This interview has been flagged for review. Please contact HR department for further assistance.",
    icon: <AlertCircle className="h-12 w-12 text-red-600" />,
    color: "bg-red-100",
  },
  scheduled: {
    title: "Ready to Begin?",
    description: "",
    icon: null,
    color: "",
  },
};

export default function Home() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params?.interview_id as string ?? "";
  const [loading, setLoading] = useState(true);
  const [interviewStatus, setInterviewStatus] = useState<"scheduled" | "completed" | "expired" | "flagged">("scheduled");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkInterviewStatus = async () => {
      try {
        const response = await getInterview(interviewId);
        if (!response.success) throw new Error(response.error);
        setInterviewStatus(response.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch interview status");
      } finally {
        setLoading(false);
      }
    };

    checkInterviewStatus();
  }, [interviewId]);

  const handleStart = () => {
    router.push(`/interview/${interviewId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="h-12 w-12 border-4 border-[#364957] border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Checking interview status...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="h-20 mb-8 mx-auto flex items-center justify-center">
            <AlertCircle className="h-16 w-16 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Error Loading Interview</h1>
          <p className="text-muted-foreground">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (interviewStatus !== "scheduled") {
    const config = statusConfig[interviewStatus];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <img
            src="https://kifiya.com/wp-content/uploads/2022/12/Logo.svg"
            alt="Kifiya Logo"
            className="h-20 mb-8 mx-auto"
          />
          <h1 className="text-4xl font-bold mb-2">Kifiya AI-Interview Platform</h1>
        </motion.div>

        <Card className="w-full max-w-2xl">
          <CardHeader>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-semibold text-center"
            >
              {config.title}
            </motion.h2>
          </CardHeader>
          <CardContent>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="flex flex-col items-center space-y-6"
            >
              <motion.div
                variants={item}
                className={`h-24 w-24 rounded-full ${config.color} flex items-center justify-center mb-4`}
              >
                {config.icon}
              </motion.div>
              <motion.p
                variants={item}
                className="text-muted-foreground text-center"
              >
                {config.description}
              </motion.p>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    // Your existing scheduled interview UI
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

      <Card className="w-full max-w-3xl">
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