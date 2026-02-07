import { useMemo } from 'react';
import type { OvertimeEntry } from '../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface OvertimeChartProps {
  entries: OvertimeEntry[];
  isLoading: boolean;
  variant?: 'line' | 'bar';
}

// Convert YYYY-MM-DD to DD-MM-YYYY
const formatDateEuropean = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};

export default function OvertimeChart({ entries, isLoading, variant = 'line' }: OvertimeChartProps) {
  const chartData = useMemo(() => {
    if (!entries || entries.length === 0) return [];

    // Group entries by date and calculate cumulative overtime
    const dateMap = new Map<string, number>();
    let cumulativeMinutes = 0;

    // Sort entries by date (oldest first)
    const sortedEntries = [...entries].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    sortedEntries.forEach((entry) => {
      const entryMinutes = Number(entry.minutes);
      cumulativeMinutes += entry.isAdd ? entryMinutes : -entryMinutes;
      
      // Store cumulative hours for this date
      const hours = cumulativeMinutes / 60;
      dateMap.set(entry.date, hours);
    });

    // Convert to array format for chart
    return Array.from(dateMap.entries()).map(([date, hours]) => ({
      date: formatDateEuropean(date),
      hours: parseFloat(hours.toFixed(2)),
    }));
  }, [entries]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overtime Trend
          </CardTitle>
          <CardDescription>Cumulative overtime hours over time</CardDescription>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">No data available yet</p>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    hours: {
      label: 'Hours',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Overtime Trend
        </CardTitle>
        <CardDescription>Cumulative overtime hours over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {variant === 'line' ? (
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="hours" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
