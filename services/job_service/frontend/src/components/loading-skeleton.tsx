// src/components/loading-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function LoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 rounded-xl border-2 p-6">
          <Skeleton className="h-5 w-24 mb-4 bg-primary/10" />
          <Skeleton className="h-6 w-3/4 mb-3 bg-primary/10" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-primary/10" />
            <Skeleton className="h-4 w-full bg-primary/10" />
            <Skeleton className="h-4 w-2/3 bg-primary/10" />
          </div>
          <div className="flex justify-between mt-4">
            <Skeleton className="h-4 w-20 bg-primary/10" />
            <Skeleton className="h-4 w-24 bg-secondary/10" />
          </div>
        </div>
      ))}
    </div>
  )
}