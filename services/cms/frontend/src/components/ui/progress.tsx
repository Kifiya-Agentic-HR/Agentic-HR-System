// components/ui/progress.tsx
import * as ProgressPrimitive from "@radix-ui/react-progress";

export const Progress = ({ value, className }: { value: number; className?: string }) => (
  <ProgressPrimitive.Root
    className={`relative overflow-hidden rounded-full bg-[#364957]/10 w-full h-2 ${className}`}
  >
    <ProgressPrimitive.Indicator
      className="h-full bg-[#FF8A00] transition-all duration-300 ease-in-out"
      style={{ width: `${value}%` }}
    />
  </ProgressPrimitive.Root>
);