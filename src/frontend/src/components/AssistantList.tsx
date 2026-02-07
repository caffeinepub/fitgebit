import type { UserProfile } from '../backend';
import { useGetOvertimeTotals } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Clock } from 'lucide-react';

interface AssistantListProps {
  assistants: UserProfile[];
  isLoading: boolean;
  selectedAssistant: UserProfile | null;
  onSelectAssistant: (assistant: UserProfile) => void;
}

function AssistantCard({ assistant, isSelected, onSelect }: {
  assistant: UserProfile;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { data: totals, isLoading } = useGetOvertimeTotals(assistant.username);

  const days = Number(totals?.totalDays || 0);
  const hours = Number(totals?.totalHours || 0);
  const minutes = Number(totals?.totalMinutes || 0);

  return (
    <Button
      variant={isSelected ? 'secondary' : 'ghost'}
      className="w-full justify-start h-auto p-4"
      onClick={onSelect}
    >
      <div className="flex w-full items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium">{assistant.username}</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-4 w-20" />
          ) : (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {days}d {hours}h {minutes}m
              </span>
            </div>
          )}
        </div>
      </div>
    </Button>
  );
}

export default function AssistantList({
  assistants,
  isLoading,
  selectedAssistant,
  onSelectAssistant,
}: AssistantListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (assistants.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <User className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No assistants registered yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-2">
        {assistants.map((assistant) => (
          <AssistantCard
            key={assistant.principal.toString()}
            assistant={assistant}
            isSelected={selectedAssistant?.principal.toString() === assistant.principal.toString()}
            onSelect={() => onSelectAssistant(assistant)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
