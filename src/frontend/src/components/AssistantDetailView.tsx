import type { UserProfile } from '../backend';
import { useGetOvertimeEntries, useGetOvertimeTotals } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import OvertimeHistory from './OvertimeHistory';
import OvertimeChart from './OvertimeChart';
import { X, Download, Trash2, User, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface AssistantDetailViewProps {
  assistant: UserProfile;
  onDelete: (assistant: UserProfile) => void;
  onClose: () => void;
}

// Convert YYYY-MM-DD to DD-MM-YYYY
const formatDateEuropean = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};

// Convert total minutes to days/hours/minutes display
const formatMinutes = (totalMinutes: number): string => {
  const days = Math.floor(totalMinutes / (8 * 60));
  const remainingAfterDays = totalMinutes % (8 * 60);
  const hours = Math.floor(remainingAfterDays / 60);
  const minutes = remainingAfterDays % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(' ');
};

export default function AssistantDetailView({ assistant, onDelete, onClose }: AssistantDetailViewProps) {
  const { data: entries = [], isLoading: entriesLoading } = useGetOvertimeEntries(assistant.username);
  const { data: totals, isLoading: totalsLoading } = useGetOvertimeTotals(assistant.username);

  const days = Number(totals?.totalDays || 0);
  const hours = Number(totals?.totalHours || 0);
  const minutes = Number(totals?.totalMinutes || 0);

  const handleExportCSV = () => {
    if (entries.length === 0) {
      toast.error('No entries to export');
      return;
    }

    const headers = ['Date', 'Type', 'Minutes', 'Time Display', 'Comment'];
    const rows = entries.map((entry) => [
      formatDateEuropean(entry.date),
      entry.isAdd ? 'Added' : 'Used',
      Number(entry.minutes).toString(),
      formatMinutes(Number(entry.minutes)),
      entry.comment,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assistant.username}_overtime_${formatDateEuropean(new Date().toISOString().split('T')[0])}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('CSV exported successfully');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{assistant.username}</CardTitle>
                <CardDescription className="capitalize">{assistant.language}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4 text-center">
              <Calendar className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
              <p className="text-2xl font-bold">{days}</p>
              <p className="text-xs text-muted-foreground">Days</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <Clock className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
              <p className="text-2xl font-bold">{hours}</p>
              <p className="text-xs text-muted-foreground">Hours</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <Clock className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
              <p className="text-2xl font-bold">{minutes}</p>
              <p className="text-xs text-muted-foreground">Minutes</p>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(assistant)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <OvertimeChart entries={entries} isLoading={entriesLoading} variant="bar" />

      <Card>
        <CardHeader>
          <CardTitle>Overtime History</CardTitle>
          <CardDescription>All overtime entries for {assistant.username}</CardDescription>
        </CardHeader>
        <CardContent>
          <OvertimeHistory entries={entries} isLoading={entriesLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
