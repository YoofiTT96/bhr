import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { useAllTimeOffRequests } from '../hooks/useTimeOff';
import ReviewModal from './ReviewModal';
import type { TimeOffRequest, TimeOffRequestStatus } from '../types/timeoff.types';

const statusStyles: Record<TimeOffRequestStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

export default function AllTimeOff() {
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = useAllTimeOffRequests(page, 20);
  const [reviewRequest, setReviewRequest] = useState<TimeOffRequest | null>(null);
  const canApprove = hasPermission('TIME_OFF_REQUEST_APPROVE');

  if (isLoading) {
    return <div className="text-gray-500 text-sm py-8">Loading all requests...</div>;
  }

  if (isError) {
    return <div className="text-red-600 text-sm py-8">Failed to load requests</div>;
  }

  if (!data || data.content.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        <Clock size={32} className="mx-auto mb-2 text-gray-300" />
        No time off requests found
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
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.content.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{req.employeeName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{req.timeOffTypeName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {req.startDate} — {req.endDate}
                  {req.halfDay && (
                    <span className="ml-1 text-xs text-gray-500">
                      ({req.halfDayPeriod?.toLowerCase()})
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{req.businessDays}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[req.status]}`}>
                    {req.status}
                  </span>
                  {req.status === 'APPROVED' && (
                    <span className={`inline-flex items-center gap-1 ml-2 text-xs ${req.calendarSynced ? 'text-blue-600' : 'text-gray-400'}`}>
                      <Calendar size={12} />
                      {req.calendarSynced ? 'Synced' : 'Not synced'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{req.reviewerName || '—'}</td>
                <td className="px-6 py-4">
                  {req.status === 'PENDING' && canApprove && (
                    <button
                      onClick={() => setReviewRequest(req)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
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

      {reviewRequest && (
        <ReviewModal request={reviewRequest} onClose={() => setReviewRequest(null)} />
      )}
    </>
  );
}
