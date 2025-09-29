import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

const LoadingSkeleton = () => {
  return Array.from({ length: 5 }).map((_, i) => (
    <Card key={i} className="py-2 px-3 mb-2">
      <CardContent className="flex items-center gap-3 px-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="h-3 w-[40%]" />
        </div>
      </CardContent>
    </Card>
  ));
};

export default LoadingSkeleton;
