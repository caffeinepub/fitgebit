import { TaskFrequency } from '../backend';

export function getFrequencyLabel(frequency: TaskFrequency): string {
  switch (frequency) {
    case TaskFrequency.daily:
      return 'Daily';
    case TaskFrequency.weekly:
      return 'Weekly';
    case TaskFrequency.monthly:
      return 'Monthly';
    default:
      return frequency;
  }
}

// Get next Monday from a given date (Mon-Thu work schedule)
function getNextMonday(fromDate: Date): Date {
  const result = new Date(fromDate);
  result.setHours(0, 0, 0, 0);
  
  // If it's Friday (5), Saturday (6), or Sunday (0), jump to next Monday
  const dayOfWeek = result.getDay();
  if (dayOfWeek === 5) {
    result.setDate(result.getDate() + 3); // Friday -> Monday
  } else if (dayOfWeek === 6) {
    result.setDate(result.getDate() + 2); // Saturday -> Monday
  } else if (dayOfWeek === 0) {
    result.setDate(result.getDate() + 1); // Sunday -> Monday
  } else if (dayOfWeek >= 1 && dayOfWeek <= 4) {
    // Monday-Thursday: go to next Monday
    result.setDate(result.getDate() + (8 - dayOfWeek));
  }
  
  return result;
}

// Get first Monday of next month
function getFirstMondayOfNextMonth(fromDate: Date): Date {
  const result = new Date(fromDate);
  result.setMonth(result.getMonth() + 1);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  
  // Find first Monday
  while (result.getDay() !== 1) {
    result.setDate(result.getDate() + 1);
  }
  
  return result;
}

export function computeNextDueDate(
  frequency: TaskFrequency,
  _dueDay: bigint | undefined, // No longer used
  lastCompleted: bigint | undefined,
  createdAt: bigint
): Date {
  const referenceTime = lastCompleted ? Number(lastCompleted) / 1000000 : Number(createdAt) / 1000000;
  const referenceDate = new Date(referenceTime);

  if (frequency === TaskFrequency.daily) {
    // Next workday (Mon-Thu only)
    const nextDue = new Date(referenceDate);
    nextDue.setDate(nextDue.getDate() + 1);
    nextDue.setHours(0, 0, 0, 0);
    
    // Skip to Monday if landing on Fri/Sat/Sun
    const dayOfWeek = nextDue.getDay();
    if (dayOfWeek === 5) {
      nextDue.setDate(nextDue.getDate() + 3); // Friday -> Monday
    } else if (dayOfWeek === 6) {
      nextDue.setDate(nextDue.getDate() + 2); // Saturday -> Monday
    } else if (dayOfWeek === 0) {
      nextDue.setDate(nextDue.getDate() + 1); // Sunday -> Monday
    }
    
    return nextDue;
  } else if (frequency === TaskFrequency.weekly) {
    // Next Monday after reference date
    return getNextMonday(referenceDate);
  } else if (frequency === TaskFrequency.monthly) {
    // First Monday of next month
    return getFirstMondayOfNextMonth(referenceDate);
  }

  return new Date();
}

export function formatNextDueDate(nextDue: Date): string {
  const now = new Date();
  const diffMs = nextDue.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else if (diffDays < 7) {
    return `Due in ${diffDays} days`;
  } else {
    return nextDue.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}

export function computeUrgencyScore(
  frequency: TaskFrequency,
  nextDue: Date,
  isPinned: boolean
): number {
  if (isPinned) {
    return 1000000; // Pinned tasks always on top
  }

  const now = new Date();
  const diffMs = nextDue.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Overdue tasks get highest urgency
  if (diffHours < 0) {
    return 100000 - diffHours; // More overdue = higher score
  }

  // Score based on proximity to due date
  let baseScore = 10000 - diffHours;

  // Adjust by frequency (daily tasks slightly more urgent)
  if (frequency === TaskFrequency.daily) {
    baseScore += 100;
  } else if (frequency === TaskFrequency.weekly) {
    baseScore += 50;
  }

  return baseScore;
}

export function getUrgencyLevel(frequency: TaskFrequency, nextDue: Date): 'high' | 'medium' | 'low' {
  const now = new Date();
  const diffMs = nextDue.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 0) {
    return 'high'; // Overdue
  }

  if (frequency === TaskFrequency.daily) {
    if (diffHours < 24) return 'high';
    if (diffHours < 48) return 'medium';
    return 'low';
  } else if (frequency === TaskFrequency.weekly) {
    if (diffHours < 48) return 'high';
    if (diffHours < 96) return 'medium';
    return 'low';
  } else {
    if (diffHours < 168) return 'high'; // 7 days
    if (diffHours < 336) return 'medium'; // 14 days
    return 'low';
  }
}
