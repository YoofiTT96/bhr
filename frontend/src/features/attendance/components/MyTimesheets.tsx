import { useNavigate } from 'react-router-dom';
import { Clock, LogIn, LogOut } from 'lucide-react';
import {
  useMyTimesheets,
  useCurrentTimesheet,
  useClockIn,
  useClockOut,
  useCreateOrGetTimesheet,
} from '../hooks/useAttendance';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import type { TimesheetStatus } from '../types/attendance.types';

const statusStyles: Record<TimesheetStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

function getMondayOfCurrentWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 1
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split('T')[0];
}

export default function MyTimesheets() {
  const navigate = useNavigate();
  const { data: timesheets, isLoading, isError } = useMyTimesheets();
  const { data: currentTimesheet } = useCurrentTimesheet();
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const createTimesheet = useCreateOrGetTimesheet();

  const handleClockIn = async () => {
    try {
      await clockIn.mutateAsync();
    } catch {
      // Error shown via clockIn.isError
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut.mutateAsync();
    } catch {
      // Error shown via clockOut.isError
    }
  };

  const handleCreateCurrentWeek = async () => {
    try {
      const result = await createTimesheet.mutateAsync({
        weekStart: getMondayOfCurrentWeek(),
      });
      navigate(`/attendance/${result.id}`);
    } catch {
      // Error shown via createTimesheet.isError
    }
  };

  // Determine clock status from current week's timesheet
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntry = currentTimesheet?.entries?.find((e) => e.entryDate === todayStr);
  const hasClockedIn = todayEntry?.clockIn != null;
  const hasClockedOut = todayEntry?.clockOut != null;

  return (
    <div className="space-y-6">
      {/* Current Week Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wider">This Week</h2>
            {currentTimesheet ? (
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {currentTimesheet.totalHours}h
                <span className={`ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[currentTimesheet.status]}`}>
                  {currentTimesheet.status}
                </span>
              </p>
            ) : (
              <p className="text-gray-500 text-sm mt-1">No timesheet for this week yet</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!hasClockedIn && (
              <button
                onClick={handleClockIn}
                disabled={clockIn.isPending}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <LogIn size={16} />
                {clockIn.isPending ? 'Clocking in...' : 'Clock In'}
              </button>
            )}
            {hasClockedIn && !hasClockedOut && (
              <button
                onClick={handleClockOut}
                disabled={clockOut.isPending}
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                <LogOut size={16} />
                {clockOut.isPending ? 'Clocking out...' : 'Clock Out'}
              </button>
            )}
            {!currentTimesheet && (
              <button
                onClick={handleCreateCurrentWeek}
                disabled={createTimesheet.isPending}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {createTimesheet.isPending ? 'Creating...' : 'Start Timesheet'}
              </button>
            )}
            {currentTimesheet && (
              <button
                onClick={() => navigate(`/attendance/${currentTimesheet.id}`)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Details
              </button>
            )}
          </div>
        </div>

        {(clockIn.isError || clockOut.isError || createTimesheet.isError) && (
          <div className="text-sm text-red-600 mt-2">
            {clockIn.isError && getApiErrorMessage(clockIn.error, 'Failed to clock in')}
            {clockOut.isError && getApiErrorMessage(clockOut.error, 'Failed to clock out')}
            {createTimesheet.isError && getApiErrorMessage(createTimesheet.error, 'Failed to create timesheet')}
          </div>
        )}
      </div>

      {/* Past Timesheets */}
      <div>
        <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-4">Past Timesheets</h2>

        {isLoading && <div className="text-gray-500 text-sm">Loading timesheets...</div>}
        {isError && <div className="text-red-600 text-sm">Failed to load timesheets</div>}

        {timesheets && timesheets.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Clock size={32} className="mx-auto mb-2 text-gray-300" />
            No timesheets yet
          </div>
        )}

        {timesheets && timesheets.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Week Of</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {timesheets.map((ts) => (
                  <tr key={ts.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{ts.weekStart}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{ts.totalHours}h</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[ts.status]}`}>
                        {ts.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{ts.reviewerName || '—'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/attendance/${ts.id}`)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
