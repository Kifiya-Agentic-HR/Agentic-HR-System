'use client';

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";
import { VideoComponent } from "@/components/VideoComponent"; 


export function VideoFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [dragConstraints, setDragConstraints] = useState({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  });
  
  const {
    isModelLoading,
    loadingProgress,
    isFacePresent,
    multipleFaces,
    lookingAway,
    lookingAwayStartTime
  } = useFaceDetection(videoRef);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDragConstraints({
        top: 0,
        left: 0,
        right: window.innerWidth - 320,
        bottom: window.innerHeight - 240
      });
    }
  }, []);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Camera Error",
          description: "Failed to access camera. Please check permissions."
        });
      }
    }
    setupCamera();
  }, [toast]);

  useEffect(() => {
    if (lookingAway && lookingAwayStartTime) {
      const timeAway = Date.now() - lookingAwayStartTime;
      if (timeAway > 5000) {
        toast({
          variant: "destructive",
          title: "Warning",
          description: "Looking away for too long! Please face the camera."
        });
      }
    }
  }, [lookingAway, lookingAwayStartTime, toast]);

  if (isModelLoading) {
    return (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-medium">Loading Face Detection</h3>
        <Progress value={loadingProgress} className="w-full" />
      </div>
    );
  }

  return (
    <motion.div
      drag
      dragConstraints={dragConstraints}
      className="fixed bottom-4 right-4 w-80 h-60 rounded-lg overflow-hidden shadow-lg"
    >
      <VideoComponent ref={videoRef} />
      {multipleFaces && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-sm">
          Multiple faces detected!
        </div>
      )}
    </motion.div>
  );
}