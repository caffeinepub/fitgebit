import type { OvertimeTotals } from '../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, Timer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface OvertimeSummaryProps {
  totals?: OvertimeTotals;
  isLoading: boolean;
}

export default function OvertimeSummary({ totals, isLoading }: OvertimeSummaryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overtime Balance</CardTitle>
          <CardDescription>Your accumulated overtime</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const days = Number(totals?.totalDays || 0);
  const hours = Number(totals?.totalHours || 0);
  const minutes = Number(totals?.totalMinutes || 0);

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Overtime Balance</CardTitle>
        <CardDescription>Your accumulated overtime</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-primary/10 p-6 text-center">
          <div className="mb-2 text-4xl font-bold text-primary">
            {days}
            <span className="ml-1 text-2xl">days</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {hours}h {minutes}m
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Workdays</span>
            </div>
            <span className="text-lg font-bold">{days}</span>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Hours</span>
            </div>
            <span className="text-lg font-bold">{hours}</span>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Minutes</span>
            </div>
            <span className="text-lg font-bold">{minutes}</span>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p>1 workday = 8 hours</p>
        </div>
      </CardContent>
    </Card>
  );
}
