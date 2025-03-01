'use client';

import { useState, useRef, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Camera, AlertCircle } from "lucide-react";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";
import Image from "next/image";
import { VideoComponent } from "@/components/VideoComponent";
import { MicrophoneTest } from "@/components/MicrophoneTest";

interface PreInterviewCheckProps {
  onComplete: () => void;
}

export function PreInterviewCheck({ onComplete }: PreInterviewCheckProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [checks, setChecks] = useState({
    camera: false,
    microphone: false,
    consent: false
  });
  const [fallbackMode, setFallbackMode] = useState(false);

  const {
    isModelLoading,
    loadingProgress,
    isFacePresent,
    multipleFaces,
    lookingAway,
    confidenceScore
  } = useFaceDetection(videoRef);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isModelLoading) {
        setFallbackMode(true);
        toast({
          title: "Face Detection Issues",
          description: "Continuing with basic camera check. Some anti-cheating features may be limited.",
          variant: "default"
        });
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isModelLoading, toast]);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setChecks(prev => ({ ...prev, camera: true }));
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Camera Error",
          description: "Please enable camera access in your browser settings to continue."
        });
      }
    }
    setupCamera();
  }, [toast]);

  const getFaceDetectionStatus = () => {
    if (!checks.camera) return { text: "Camera not detected", color: "text-red-500", icon: "❌" };
    if (fallbackMode) return { text: "Basic camera check passed", color: "text-emerald-500", icon: "✅" };
    if (isModelLoading) return { text: "Loading detection model...", color: "text-amber-500", icon: "⏳" };
    if (!isFacePresent) return { text: "No face detected", color: "text-red-500", icon: "👤" };
    if (multipleFaces) return { text: "Multiple faces detected", color: "text-red-500", icon: "👥" };
    if (confidenceScore < 0.6) return { text: "Poor lighting conditions", color: "text-amber-500", icon: "💡" };
    if (lookingAway) return { text: "Face not centered", color: "text-amber-500", icon: "👀" };
    return { text: "Face detected", color: "text-emerald-500", icon: "✅" };
  };

  const isComplete = checks.camera && 
                    checks.microphone && 
                    checks.consent && 
                    (fallbackMode || (!isModelLoading && isFacePresent && !multipleFaces && confidenceScore > 0.6 && !lookingAway));

  const faceStatus = getFaceDetectionStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="space-y-2">
          <Image
            src="https://kifiya.com/wp-content/uploads/2022/12/Logo.svg"
            alt="Kifiya Logo"
            width={120}
            height={32}
            className="mb-4"
            priority
          />
          <h2 className="text-2xl font-semibold tracking-tight">System Check</h2>
          <p className="text-sm text-muted-foreground">
            Let's ensure everything is set up correctly before we begin
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <motion.div 
              className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video shadow-inner"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <VideoComponent ref={videoRef} />
              <AnimatePresence>
                {isModelLoading && !fallbackMode && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                  >
                    <div className="text-center text-white">
                      <p className="mb-2 font-medium">Loading face detection models...</p>
                      <Progress value={loadingProgress} className="w-48" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              className="flex justify-between items-center"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-[#364957]" />
                <span className="font-medium">Camera & Face Detection</span>
              </div>
              <div className={`flex items-center gap-1 ${faceStatus.color}`}>
                <span className="text-base">{faceStatus.icon}</span>
                <span className="text-sm font-medium">{faceStatus.text}</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <MicrophoneTest 
                onReady={(ready) => setChecks(prev => ({ ...prev, microphone: ready }))}
              />
            </motion.div>

            <motion.div 
              className="flex items-center space-x-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Checkbox
                id="consent"
                checked={checks.consent}
                onCheckedChange={(checked) =>
                  setChecks(prev => ({ ...prev, consent: checked === true }))
                }
              />
              <label
                htmlFor="consent"
                className="text-sm leading-none"
              >
                I consent to video/audio recording and behavioral tracking during the interview
              </label>
            </motion.div>

            {!isComplete && checks.camera && checks.microphone && checks.consent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm flex items-start gap-2"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Please ensure:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>You are in a well-lit environment</li>
                    <li>Your face is clearly visible and centered</li>
                    <li>You are the only person in the frame</li>
                    <li>Your camera is stable and focused</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <motion.div 
            className="w-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              className="w-full bg-[#364957] hover:bg-[#364957]/90 text-white"
              onClick={onComplete}
              disabled={!isComplete}
            >
              {isModelLoading && !fallbackMode ? 
                `Loading Models (${loadingProgress}%)` : 
                "Start Interview"
              }
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}