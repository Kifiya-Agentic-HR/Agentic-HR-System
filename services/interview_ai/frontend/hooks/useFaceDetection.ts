'use client';

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export type FaceDetectionState = {
  isModelLoading: boolean;
  loadingProgress: number;
  isFacePresent: boolean;
  multipleFaces: boolean;
  lookingAway: boolean;
  lookingAwayStartTime: number | null;
  confidenceScore: number;
};

export function useFaceDetection(videoRef: RefObject<HTMLVideoElement | null>) {
  const [state, setState] = useState<FaceDetectionState>({
    isModelLoading: true,
    loadingProgress: 0,
    isFacePresent: false,
    multipleFaces: false,
    lookingAway: false,
    lookingAwayStartTime: null,
    confidenceScore: 0
  });

  const detectionRef = useRef<number | null>(null);
  const faceapiRef = useRef<typeof import("face-api.js") | null>(null);
  
  useEffect(() => {
    const loadModels = async () => {
      try {
        if (typeof window === "undefined") return;
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model/';

        // Dynamically import face-api.js only on client side
        faceapiRef.current = await import("face-api.js");
        
        // Simulate model loading progress
        const modelProgress = [0, 30, 50, 75, 95, 100];
        for (const progress of modelProgress) {
          setState(prev => ({ ...prev, loadingProgress: progress }));
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (!faceapiRef.current) return;

        // Load the more robust SSD model along with landmark and recognition nets
        await Promise.all([
          faceapiRef.current.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapiRef.current.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapiRef.current.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);

        setState(prev => ({ ...prev, isModelLoading: false }));
      } catch (error) {
        console.error("Error loading face detection models:", error);
      }
    };

    loadModels();
    return () => {
      detectionRef.current && cancelAnimationFrame(detectionRef.current);
    };
  }, []);

  useEffect(() => {
    const detectFace = async () => {
      const video = videoRef.current;
      if (!video || !faceapiRef.current || video.readyState < 2) {
        detectionRef.current = requestAnimationFrame(detectFace);
        return;
      }

      try {
        // Use SSD Mobilenet V1 for improved accuracy with a minConfidence threshold of 0.5
        const detections = await faceapiRef.current
          .detectAllFaces(video, new faceapiRef.current.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks();

        const confidenceScore = detections[0]?.detection?.score || 0;
        const now = Date.now();

        setState(prev => ({
          ...prev,
          isFacePresent: detections.length > 0 && confidenceScore >= 0.5,
          multipleFaces: detections.length > 1,
          lookingAway: detections.length === 0,
          confidenceScore,
          lookingAwayStartTime: detections.length === 0 
            ? (prev.lookingAwayStartTime || now)
            : null
        }));

      } catch (error) {
        console.error("Face detection error:", error);
      }
      detectionRef.current = requestAnimationFrame(detectFace);
    };

    const video = videoRef.current;
    if (!video || state.isModelLoading) return;

    const handleVideoPlay = () => detectFace();
    
    video.addEventListener('play', handleVideoPlay);
    return () => {
      video.removeEventListener('play', handleVideoPlay);
      detectionRef.current && cancelAnimationFrame(detectionRef.current);
    };
  }, [state.isModelLoading, videoRef]);

  return state;
}