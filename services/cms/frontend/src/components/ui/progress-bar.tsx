'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  color?: string;
  className?: string;
}

export default function ProgressBar({ 
  value, 
  color = '#FF8A00', 
  className = '' 
}: ProgressBarProps) {
  return (
    <div 
      className={`relative w-full bg-[#364957]/10 rounded-full overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="h-full rounded-full relative"
        style={{ backgroundColor: color }}
      >
        <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
      </motion.div>
    </div>
  );
}