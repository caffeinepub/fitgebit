/**
 * Centralized overtime date utilities for consistent DD MM YYYY formatting
 * and local-timezone date handling to avoid UTC off-by-one issues.
 */

/**
 * Format backend overtime ISO date (YYYY-MM-DD) to display format (DD MM YYYY with spaces)
 * @param dateStr - ISO date string in YYYY-MM-DD format
 * @returns Formatted date string in DD MM YYYY format (e.g., "08 02 2026")
 */
export function formatOvertimeDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day} ${month} ${year}`;
}

/**
 * Get today's date in YYYY-MM-DD format using local timezone
 * (avoids UTC toISOString off-by-one issues)
 * @returns Local date string in YYYY-MM-DD format
 */
export function getLocalToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date string is in the future (compared to local today)
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns true if the date is in the future
 */
export function isFutureDate(dateStr: string): boolean {
  const selectedDate = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate > today;
}
