'use client';

import { RefObject, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Updated VideoFeed component
export function VideoFeed({ videoRef }: { videoRef: RefObject<HTMLVideoElement> }) {
  // Remove local face detection hook usage
  const { toast } = useToast();

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user", width: 1280, height: 720 } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(error => {
            toast({
              variant: "destructive",
              title: "Camera Error",
              description: "Please enable camera permissions to continue"
            });
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Camera Required",
          description: "Camera access is mandatory for this interview"
        });
      }
    }
    
    if (videoRef.current) setupCamera();
  }, [toast, videoRef]);

  return (
    <motion.div
      drag
      dragConstraints={dragConstraints}
      className="fixed bottom-4 right-4 w-80 h-60 rounded-lg overflow-hidden shadow-lg z-[100] bg-black"
    >
      <video 
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}