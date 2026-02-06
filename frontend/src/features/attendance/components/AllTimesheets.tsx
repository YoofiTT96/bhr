import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { useAllTimesheets } from '../hooks/useAttendance';
import ReviewTimesheetModal from './ReviewTimesheetModal';
import type { Timesheet, TimesheetStatus } from '../types/attendance.types';

const statusStyles: Record<TimesheetStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function AllTimesheets() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = useAllTimesheets(page, 20);
  const [reviewTimesheet, setReviewTimesheet] = useState<Timesheet | null>(null);
  const canApprove = hasPermission('TIMESHEET_APPROVE');

  if (isLoading) {
    return <div className="text-gray-500 text-sm py-8">Loading all timesheets...</div>;
  }

  if (isError) {
    return <div className="text-red-600 text-sm py-8">Failed to load timesheets</div>;
  }

  if (!data || data.content.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        <Clock size={32} className="mx-auto mb-2 text-gray-300" />
        No timesheets found
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
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.content.map((ts) => (
              <tr key={ts.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{ts.employeeName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{ts.weekStart}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{ts.totalHours}h</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[ts.status]}`}>
                    {ts.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{ts.reviewerName || '—'}</td>
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <span>
          Showing {data.number * data.size + 1}–
          {Math.min((data.number + 1) * data.size, data.totalElements)} of {data.totalElements}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={data.first}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <span>
            Page {data.number + 1} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={data.last}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {reviewTimesheet && (
        <ReviewTimesheetModal timesheet={reviewTimesheet} onClose={() => setReviewTimesheet(null)} />
      )}
    </>
  );
}
