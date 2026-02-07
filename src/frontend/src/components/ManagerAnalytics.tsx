import { useMemo } from 'react';
import type { UserProfile } from '../backend';
import { useGetOvertimeTotals } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Users, Clock, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ManagerAnalyticsProps {
  assistants: UserProfile[];
}

interface AssistantWithTotals {
  assistant: UserProfile;
  days: number;
  hours: number;
  minutes: number;
  totalHours: number;
  isLoading: boolean;
}

function AssistantOvertimeBar({ data }: { data: AssistantWithTotals }) {
  if (data.isLoading) {
    return <Skeleton className="h-12 w-full" />;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{data.assistant.username}</span>
        <span className="text-muted-foreground">
          {data.days}d {data.hours}h {data.minutes}m
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${Math.min((data.totalHours / 80) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

function AssistantSummaryRow({ data }: { data: AssistantWithTotals }) {
  if (data.isLoading) {
    return <Skeleton className="h-16 w-full" />;
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{data.assistant.username}</p>
          <p className="text-xs text-muted-foreground capitalize">{data.assistant.language}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">
          {data.days}d {data.hours}h {data.minutes}m
        </p>
        <p className="text-xs text-muted-foreground">Total overtime</p>
      </div>
    </div>
  );
}

function TeamOvertimeBarChart({ chartData }: { chartData: { username: string; hours: number }[] }) {
  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  const chartConfig = {
    hours: {
      label: 'Hours',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="username" 
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
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
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default function ManagerAnalytics({ assistants }: ManagerAnalyticsProps) {
  // Call all hooks at the top level for each assistant
  const assistantTotalsQueries = assistants.map((assistant) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: totals, isLoading } = useGetOvertimeTotals(assistant.username);
    return { assistant, totals, isLoading };
  });

  // Process data for all assistants
  const assistantsWithTotals: AssistantWithTotals[] = useMemo(() => {
    return assistantTotalsQueries.map(({ assistant, totals, isLoading }) => {
      const days = Number(totals?.totalDays || 0);
      const hours = Number(totals?.totalHours || 0);
      const minutes = Number(totals?.totalMinutes || 0);
      const totalHours = days * 8 + hours + minutes / 60;

      return {
        assistant,
        days,
        hours,
        minutes,
        totalHours,
        isLoading,
      };
    });
  }, [assistantTotalsQueries]);

  // Calculate team totals
  const teamTotals = useMemo(() => {
    let totalMinutes = 0;
    assistantsWithTotals.forEach(({ days, hours, minutes }) => {
      totalMinutes += days * 8 * 60 + hours * 60 + minutes;
    });

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const totalDays = Math.floor(totalHours / 8);
    const remainingHours = totalHours % 8;

    return {
      totalDays,
      totalHours: remainingHours,
      totalMinutes: remainingMinutes,
    };
  }, [assistantsWithTotals]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return assistantsWithTotals.map(({ assistant, totalHours }) => ({
      username: assistant.username,
      hours: parseFloat(totalHours.toFixed(2)),
    }));
  }, [assistantsWithTotals]);

  if (assistants.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No Data Available</p>
            <p className="text-sm text-muted-foreground">Add assistants to see analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assistants.length}</div>
            <p className="text-xs text-muted-foreground">Active assistants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Overtime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamTotals.totalDays} days</div>
            <p className="text-xs text-muted-foreground">
              {teamTotals.totalHours}h {teamTotals.totalMinutes}m across all team
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Assistant</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assistants.length > 0 ? Math.round(teamTotals.totalDays / assistants.length) : 0} days
            </div>
            <p className="text-xs text-muted-foreground">Mean overtime balance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overtime Distribution</CardTitle>
          <CardDescription>Overtime hours by team member</CardDescription>
        </CardHeader>
        <CardContent>
          <TeamOvertimeBarChart chartData={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Progress</CardTitle>
          <CardDescription>Individual overtime balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assistantsWithTotals.map((data) => (
              <AssistantOvertimeBar key={data.assistant.principal.toString()} data={data} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Overview</CardTitle>
          <CardDescription>Detailed breakdown of all assistants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assistantsWithTotals.map((data) => (
              <AssistantSummaryRow key={data.assistant.principal.toString()} data={data} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
