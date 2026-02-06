import { useState } from 'react';
import { Clock, Calendar, Paperclip, AlertCircle } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { useTeamTimeOffRequests } from '../hooks/useTimeOff';
import ReviewModal from './ReviewModal';
import type { TimeOffRequest, TimeOffRequestStatus } from '../types/timeoff.types';

const statusStyles: Record<TimeOffRequestStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

export default function TeamTimeOff() {
  const { hasPermission } = useAuth();
  const { data: requests, isLoading, isError } = useTeamTimeOffRequests();
  const [reviewRequest, setReviewRequest] = useState<TimeOffRequest | null>(null);
  const canApprove = hasPermission('TIME_OFF_REQUEST_APPROVE');

  // Sort pending requests first
  const sortedRequests = requests
    ? [...requests].sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
    : [];

  if (isLoading) {
    return <div className="text-gray-500 text-sm py-8">Loading team requests...</div>;
  }

  if (isError) {
    return <div className="text-red-600 text-sm py-8">Failed to load team requests</div>;
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        <Clock size={32} className="mx-auto mb-2 text-gray-300" />
        No team requests found
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
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedRequests.map((req) => (
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
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[req.status]}`}>
                      {req.status}
                    </span>
                    {req.status === 'APPROVED' && (
                      <span className={`inline-flex items-center gap-1 text-xs ${req.calendarSynced ? 'text-blue-600' : 'text-gray-400'}`}>
                        <Calendar size={12} />
                        {req.calendarSynced ? 'Synced' : 'Not synced'}
                      </span>
                    )}
                    {req.hasAttachment && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600" title={req.attachmentFileName}>
                        <Paperclip size={12} />
                        Attached
                      </span>
                    )}
                    {req.attachmentRequired && !req.hasAttachment && req.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 text-xs text-orange-600">
                        <AlertCircle size={12} />
                        Attachment needed
                      </span>
                    )}
                  </div>
                </td>
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

      {reviewRequest && (
        <ReviewModal request={reviewRequest} onClose={() => setReviewRequest(null)} />
      )}
    </>
  );
}
