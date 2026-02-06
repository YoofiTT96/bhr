import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { useTeamTimesheets } from '../hooks/useAttendance';
import ReviewTimesheetModal from './ReviewTimesheetModal';
import type { Timesheet, TimesheetStatus } from '../types/attendance.types';

const statusStyles: Record<TimesheetStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function TeamTimesheets() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { data: timesheets, isLoading, isError } = useTeamTimesheets();
  const [reviewTimesheet, setReviewTimesheet] = useState<Timesheet | null>(null);
  const canApprove = hasPermission('TIMESHEET_APPROVE');

  const sortedTimesheets = timesheets
    ? [...timesheets].sort((a, b) => {
        if (a.status === 'SUBMITTED' && b.status !== 'SUBMITTED') return -1;
        if (a.status !== 'SUBMITTED' && b.status === 'SUBMITTED') return 1;
        return b.weekStart.localeCompare(a.weekStart);
      })
    : [];

  if (isLoading) {
    return <div className="text-gray-500 text-sm py-8">Loading team timesheets...</div>;
  }

  if (isError) {
    return <div className="text-red-600 text-sm py-8">Failed to load team timesheets</div>;
  }

  if (!timesheets || timesheets.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        <Clock size={32} className="mx-auto mb-2 text-gray-300" />
        No team timesheets found
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Week Of</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedTimesheets.map((ts) => (
              <tr key={ts.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{ts.employeeName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{ts.weekStart}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{ts.totalHours}h</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[ts.status]}`}>
                    {ts.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/attendance/${ts.id}`)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View
                  </button>
                  {ts.status === 'SUBMITTED' && canApprove && (
                    <button
                      onClick={() => setReviewTimesheet(ts)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Review
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reviewTimesheet && (
        <ReviewTimesheetModal timesheet={reviewTimesheet} onClose={() => setReviewTimesheet(null)} />
      )}
    </>
  );
}
