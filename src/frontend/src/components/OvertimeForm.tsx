import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface OvertimeFormProps {
  onSubmit: (data: {
    date: string;
    minutes: number;
    comment: string;
    isAdd: boolean;
  }) => Promise<void>;
  isAdd: boolean;
  isLoading: boolean;
}

// Convert DD-MM-YYYY to YYYY-MM-DD for backend
const formatDateForBackend = (ddmmyyyy: string): string => {
  const [day, month, year] = ddmmyyyy.split('-');
  return `${year}-${month}-${day}`;
};

// Convert YYYY-MM-DD to DD-MM-YYYY for display
const formatDateForDisplay = (yyyymmdd: string): string => {
  const [year, month, day] = yyyymmdd.split('-');
  return `${day}-${month}-${year}`;
};

export default function OvertimeForm({ onSubmit, isAdd, isLoading }: OvertimeFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(formatDateForDisplay(today));
  const [minutes, setMinutes] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const minutesNum = parseInt(minutes) || 0;

    // Validation
    if (minutesNum === 0) {
      toast.error('Please enter minutes');
      return;
    }

    if (minutesNum < 0) {
      toast.error('Minutes cannot be negative');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(date)) {
      toast.error('Please enter a valid date (DD-MM-YYYY)');
      return;
    }

    const backendDate = formatDateForBackend(date);
    const selectedDate = new Date(backendDate);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime())) {
      toast.error('Please enter a valid date');
      return;
    }

    if (selectedDate > todayDate) {
      toast.error('Cannot log overtime for future dates');
      return;
    }

    try {
      await onSubmit({
        date: backendDate,
        minutes: minutesNum,
        comment: comment.trim(),
        isAdd,
      });

      toast.success(isAdd ? 'Overtime added successfully!' : 'Overtime used successfully!');
      
      // Reset form
      setMinutes('');
      setComment('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to log overtime');
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow user to type freely
    setDate(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="text"
          value={date}
          onChange={handleDateChange}
          disabled={isLoading}
          placeholder="DD-MM-YYYY"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="minutes">Minutes</Label>
        <Input
          id="minutes"
          type="number"
          min="0"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          disabled={isLoading}
          placeholder="0"
        />
        <p className="text-xs text-muted-foreground">Enter total minutes (e.g., 90 for 1 hour 30 minutes)</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Comment (optional)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isLoading}
          placeholder={isAdd ? 'e.g., Emergency patient care' : 'e.g., Took time off'}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : isAdd ? (
          'Add Overtime'
        ) : (
          'Use Overtime'
        )}
      </Button>
    </form>
  );
}
