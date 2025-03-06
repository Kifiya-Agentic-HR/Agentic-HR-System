'use client';

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Camera, AlertCircle } from "lucide-react";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { VideoComponent } from "@/components/VideoComponent"
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
                    checks.consent
                    //  && 
                    // (fallbackMode || (!isModelLoading && isFacePresent && !multipleFaces && confidenceScore > 0.6 && !lookingAway));

  const faceStatus = getFaceDetectionStatus();

  const handleComplete = () => {
    onComplete();
    
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-4 bg-gray-50"
    >
      <Card className="w-full max-w-lg mx-auto shadow-2xl border-0">
        <CardHeader className="space-y-3 bg-[#364957] text-white rounded-t-lg pb-6">
          <div className="flex items-center justify-between">
            <Image
              src="https://kifiya.com/wp-content/uploads/2022/12/Logo.svg"
              alt="Kifiya Logo"
              width={120}
              height={32}
              className="brightness-0 invert"
              priority
            />
            <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium">
              System Check
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Interview Preparation</h2>
          <p className="text-sm text-gray-200 opacity-90">
            Complete these checks to ensure the best interview experience
          </p>
        </CardHeader>

        <CardContent className="space-y-8 p-6">
          <motion.div 
            className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video shadow-lg border border-gray-200"
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
                  className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                  <div className="text-center text-white p-6">
                    <div className="animate-spin mb-4">⚙️</div>
                    <p className="mb-3 font-medium">Initializing Face Detection</p>
                    <Progress 
                      value={loadingProgress} 
                      className="w-56 h-2 bg-white/20" 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="space-y-6">
            <motion.div 
              className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#364957]/10 rounded-full">
                    <Camera className="h-5 w-5 text-[#364957]" />
                  </div>
                  <span className="font-semibold">Camera Check</span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  faceStatus.color === 'text-emerald-500' ? 'bg-emerald-50' : 
                  faceStatus.color === 'text-amber-500' ? 'bg-amber-50' : 'bg-red-50'
                }`}>
                  <span className="text-base">{faceStatus.icon}</span>
                  <span className="text-sm font-medium">{faceStatus.text}</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <MicrophoneTest 
                onReady={(ready) => setChecks(prev => ({ ...prev, microphone: ready }))}
              />
            </motion.div>

            <motion.div 
              className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="consent"
                  checked={checks.consent}
                  onCheckedChange={(checked) =>
                    setChecks(prev => ({ ...prev, consent: checked === true }))
                  }
                  className="data-[state=checked]:bg-[#364957] data-[state=checked]:border-[#364957]"
                />
                <label
                  htmlFor="consent"
                  className="text-sm leading-tight"
                >
                  I consent to video/audio recording and behavioral tracking during the interview
                </label>
              </div>
            </motion.div>

            {!isComplete && checks.camera && checks.microphone && checks.consent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-amber-50 rounded-lg p-4 text-amber-800 text-sm flex items-start gap-3 border border-amber-200"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-500" />
                <div className="space-y-2">
                  <p className="font-medium">Final Checklist</p>
                  <ul className="space-y-1.5">
                    {['Well-lit environment', 'Face clearly visible', 'Single person in frame', 'Stable camera'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <motion.div 
            className="w-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              className="w-full bg-[#364957] hover:bg-[#364957]/90 text-white h-12 text-base font-medium rounded-lg"
              onClick={handleComplete}
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