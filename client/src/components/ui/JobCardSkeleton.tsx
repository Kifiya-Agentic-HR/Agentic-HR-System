export const JobCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <CardTitle>
        <div className="h-6 bg-muted rounded w-3/4" />
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="h-4 bg-muted rounded w-full" />
      <div className="h-4 bg-muted rounded w-2/3" />
      <div className="flex gap-2">
        <div className="h-6 w-20 bg-muted rounded-full" />
        <div className="h-6 w-24 bg-muted rounded-full" />
      </div>
    </CardContent>
  </Card>
);
