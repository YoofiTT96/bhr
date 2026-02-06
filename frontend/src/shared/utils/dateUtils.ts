/**
 * Date utility functions with clear documentation.
 *
 * These utilities handle common date operations used throughout the application,
 * particularly for timesheet/attendance features that work with weeks.
 */

/**
 * Gets the Monday of the week containing the given date.
 *
 * Uses ISO week definition where Monday is the first day of the week.
 * Handles the edge case where Sunday (day 0 in JS) should go back to the previous Monday.
 *
 * @param date - The date to find the Monday for
 * @returns A new Date object set to Monday 00:00:00.000
 *
 * @example
 * ```ts
 * getMonday(new Date('2024-01-17')); // Returns 2024-01-15 (Monday)
 * getMonday(new Date('2024-01-14')); // Returns 2024-01-08 (previous Monday, since Jan 14 is Sunday)
 * ```
 */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const dayOfWeek = d.getDay();

  // Calculate days to subtract to get to Monday
  // Sunday (0) -> subtract 6 days to get previous Monday
  // Monday (1) -> subtract 0 days
  // Tuesday (2) -> subtract 1 day
  // etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  d.setDate(d.getDate() - daysToSubtract);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Gets the Sunday of the week containing the given date.
 *
 * @param date - The date to find the Sunday for
 * @returns A new Date object set to Sunday 00:00:00.000
 */
export function getSunday(date: Date): Date {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return sunday;
}

/**
 * Formats a date string (YYYY-MM-DD) to a user-friendly format.
 *
 * @param dateStr - ISO date string (e.g., "2024-01-15")
 * @returns Formatted string (e.g., "Mon, 15 Jan")
 *
 * @example
 * ```ts
 * formatDate('2024-01-15'); // "Mon, 15 Jan"
 * ```
 */
export function formatDate(dateStr: string): string {
  // Append time to avoid timezone issues when parsing date-only strings
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Formats a date range for display.
 *
 * @param start - Start date string (YYYY-MM-DD)
 * @param end - End date string (YYYY-MM-DD)
 * @returns Formatted range (e.g., "Mon, 15 Jan - Fri, 19 Jan") or single date if same
 */
export function formatDateRange(start: string, end: string): string {
  if (start === end) return formatDate(start);
  return `${formatDate(start)} - ${formatDate(end)}`;
}

/**
 * Converts 24-hour time format to 12-hour AM/PM format.
 *
 * @param timeStr - Time in HH:MM format (e.g., "14:30")
 * @returns Formatted time (e.g., "2:30 PM") or empty string if input is null/undefined
 *
 * @example
 * ```ts
 * formatTime('14:30'); // "2:30 PM"
 * formatTime('09:00'); // "9:00 AM"
 * formatTime('00:00'); // "12:00 AM"
 * formatTime('12:00'); // "12:00 PM"
 * ```
 */
export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '';

  const [hours, minutes] = timeStr.split(':');
  const hour24 = parseInt(hours, 10);

  // Determine AM/PM: 12:00-23:59 is PM (except special case of 12:xx which is noon)
  const ampm = hour24 >= 12 ? 'PM' : 'AM';

  // Convert to 12-hour format
  // 0 -> 12 (midnight)
  // 1-11 -> 1-11
  // 12 -> 12 (noon)
  // 13-23 -> 1-11
  const hour12 = hour24 % 12 || 12;

  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Computes hours worked between clock-in and clock-out times.
 *
 * @param clockIn - Clock-in time in HH:MM format
 * @param clockOut - Clock-out time in HH:MM format
 * @returns Hours worked, rounded to 1 decimal place (e.g., 8.5)
 *
 * @example
 * ```ts
 * computeHours('09:00', '17:30'); // 8.5
 * computeHours('09:00', '09:00'); // 0 (same time)
 * computeHours('17:00', '09:00'); // 0 (invalid: out before in)
 * ```
 */
export function computeHours(clockIn: string, clockOut: string): number {
  if (!clockIn || !clockOut) return 0;

  const [inH, inM] = clockIn.split(':').map(Number);
  const [outH, outM] = clockOut.split(':').map(Number);

  const totalMinutesIn = inH * 60 + inM;
  const totalMinutesOut = outH * 60 + outM;
  const diffMinutes = totalMinutesOut - totalMinutesIn;

  // Return 0 for invalid cases (clock out before clock in)
  if (diffMinutes <= 0) return 0;

  // Convert to hours and round to 1 decimal place
  // Multiply by 10, round, divide by 10 gives us 1 decimal precision
  const DECIMAL_PRECISION = 10;
  return Math.round((diffMinutes / 60) * DECIMAL_PRECISION) / DECIMAL_PRECISION;
}

/**
 * Checks if a day index represents a weekend.
 *
 * @param dayIndex - Day index where Monday = 0, Sunday = 6
 * @returns True if Saturday (5) or Sunday (6)
 */
export function isWeekend(dayIndex: number): boolean {
  const SATURDAY_INDEX = 5;
  return dayIndex >= SATURDAY_INDEX;
}

/**
 * Formats a week label for display (e.g., "13 Jan - 19 Jan 2024").
 *
 * @param monday - The Monday of the week
 * @param sunday - The Sunday of the week
 * @returns Formatted week label
 */
export function formatWeekLabel(monday: Date, sunday: Date): string {
  const mondayStr = monday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const sundayStr = sunday.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${mondayStr} - ${sundayStr}`;
}
