/**
 * Shared utility for consistent overtime entry cell styling.
 * Returns className for overtime value cells based on entry type.
 */
export function getOvertimeCellClass(isAdd: boolean): string {
  return isAdd ? 'bg-overtime-add' : 'bg-overtime-use';
}
