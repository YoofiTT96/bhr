import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useUpdateEntries } from '../hooks/useAttendance';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import type { Timesheet, TimesheetEntryRequest } from '../types/attendance.types';

interface WeeklyGridProps {
  timesheet: Timesheet;
  editable?: boolean;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates(weekStart: string): string[] {
  const start = new Date(weekStart + 'T00:00:00');
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function computeHours(clockIn: string, clockOut: string): number {
  if (!clockIn || !clockOut) return 0;
  const [inH, inM] = clockIn.split(':').map(Number);
  const [outH, outM] = clockOut.split(':').map(Number);
  const diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
  if (diffMinutes <= 0) return 0;
  return Math.round((diffMinutes / 60) * 10) / 10;
}

export default function WeeklyGrid({ timesheet, editable = false }: WeeklyGridProps) {
  const updateEntries = useUpdateEntries();
  const weekDates = getWeekDates(timesheet.weekStart);

  const entryMap = new Map(
    (timesheet.entries ?? []).map((e) => [e.entryDate, e])
  );

  const [clockIns, setClockIns] = useState<Record<string, string>>({});
  const [clockOuts, setClockOuts] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialClockIns: Record<string, string> = {};
    const initialClockOuts: Record<string, string> = {};
    for (const date of weekDates) {
      const entry = entryMap.get(date);
      initialClockIns[date] = entry?.clockIn ?? '';
      initialClockOuts[date] = entry?.clockOut ?? '';
    }
    setClockIns(initialClockIns);
    setClockOuts(initialClockOuts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timesheet.id, timesheet.entries?.length]);

  const getHoursForDate = (date: string): number => {
    if (editable) {
      return computeHours(clockIns[date] ?? '', clockOuts[date] ?? '');
    }
    const entry = entryMap.get(date);
    return entry ? entry.hours : 0;
  };

  const totalHours = weekDates.reduce((sum, date) => sum + getHoursForDate(date), 0);

  const handleSave = async () => {
    const entries: TimesheetEntryRequest[] = weekDates
      .filter((date) => clockIns[date] && clockOuts[date])
      .map((date) => ({
        entryDate: date,
        clockIn: clockIns[date],
        clockOut: clockOuts[date],
        hours: computeHours(clockIns[date], clockOuts[date]),
      }));

    try {
      await updateEntries.mutateAsync({ id: timesheet.id, data: { entries } });
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {weekDates.map((date, i) => {
              const entry = entryMap.get(date);
              const isWeekend = i >= 5;
              const rowHours = getHoursForDate(date);

              return (
                <tr key={date} className={isWeekend ? 'bg-gray-50/50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">
                    {DAY_LABELS[i]}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {editable ? (
                      <input
                        type="time"
                        value={clockIns[date] ?? ''}
                        onChange={(e) =>
                          setClockIns((prev) => ({ ...prev, [date]: e.target.value }))
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      entry?.clockIn ?? '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {editable ? (
                      <input
                        type="time"
                        value={clockOuts[date] ?? ''}
                        onChange={(e) =>
                          setClockOuts((prev) => ({ ...prev, [date]: e.target.value }))
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      entry?.clockOut ?? '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {rowHours > 0 ? `${rowHours.toFixed(1)}` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 border-t border-gray-200">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
                Total
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                {totalHours.toFixed(1)}h
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {editable && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={updateEntries.isPending}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save size={16} />
            {updateEntries.isPending ? 'Saving...' : 'Save Entries'}
          </button>
          {updateEntries.isError && (
            <span className="text-sm text-red-600">
              {getApiErrorMessage(updateEntries.error, 'Failed to save entries')}
            </span>
          )}
          {updateEntries.isSuccess && (
            <span className="text-sm text-green-600">Saved</span>
          )}
        </div>
      )}
    </div>
  );
}
