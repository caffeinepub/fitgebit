import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertCircle, FileText, Search } from 'lucide-react';
import { useGetAuditLog, useGetAllTasks } from '../../hooks/useQueries';
import type { AuditLogAction } from '../../backend';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AuditLogView() {
  const [filterAction, setFilterAction] = useState<'all' | AuditLogAction>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: auditLog = [], isLoading, error } = useGetAuditLog();
  const { data: tasks = [] } = useGetAllTasks();

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionBadgeVariant = (action: AuditLogAction): 'default' | 'secondary' | 'outline' => {
    switch (action) {
      case 'taskCreated':
        return 'default';
      case 'taskUpdated':
        return 'secondary';
      case 'taskMarkedDone':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getActionLabel = (action: AuditLogAction): string => {
    switch (action) {
      case 'taskCreated':
        return 'Created';
      case 'taskUpdated':
        return 'Updated';
      case 'taskMarkedDone':
        return 'Marked Done';
      default:
        return action;
    }
  };

  const getTaskTitle = (taskId: bigint): string => {
    const task = tasks.find((t) => t.id === taskId);
    return task ? task.title : `Task #${taskId}`;
  };

  // Filter and sort audit log (newest first)
  const filteredLog = auditLog
    .filter((entry) => {
      const matchesAction = filterAction === 'all' || entry.action === filterAction;
      const matchesSearch =
        entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.changeSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getTaskTitle(entry.taskId).toLowerCase().includes(searchQuery.toLowerCase());
      return matchesAction && matchesSearch;
    })
    .sort((a, b) => Number(b.timestamp - a.timestamp));

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>Task activity history</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load audit log'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>Complete history of all task actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by user, task, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterAction} onValueChange={(value) => setFilterAction(value as any)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="taskCreated">Created</SelectItem>
              <SelectItem value="taskUpdated">Updated</SelectItem>
              <SelectItem value="taskMarkedDone">Marked Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading audit log...</p>
          </div>
        ) : filteredLog.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No audit entries found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || filterAction !== 'all'
                ? 'Try adjusting your filters'
                : 'Task actions will appear here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead className="hidden lg:table-cell">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLog.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatTimestamp(entry.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium">{entry.username}</TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(entry.action)}>
                        {getActionLabel(entry.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getTaskTitle(entry.taskId)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">{entry.changeSummary}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
