import { useState } from 'react';
import { Plus, Clock, XCircle, Calendar } from 'lucide-react';
import { useMyBalances, useMyTimeOffRequests, useCancelTimeOffRequest } from '../hooks/useTimeOff';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import BalanceCard from './BalanceCard';
import RequestTimeOffModal from './RequestTimeOffModal';
import type { TimeOffRequestStatus } from '../types/timeoff.types';

const statusStyles: Record<TimeOffRequestStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

export default function MyTimeOff() {
  const [showModal, setShowModal] = useState(false);
  const { data: balances, isLoading: balancesLoading, isError: balancesError } = useMyBalances();
  const { data: requests, isLoading: requestsLoading, isError: requestsError } = useMyTimeOffRequests();
  const cancelRequest = useCancelTimeOffRequest();

  const handleCancel = async (requestId: string) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      try {
        await cancelRequest.mutateAsync(requestId);
      } catch {
        // Error shown via cancelRequest.isError below
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wider">My Balances</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Request Time Off
          </button>
        </div>

        {balancesLoading && <div className="text-gray-500 text-sm">Loading balances...</div>}
        {balancesError && <div className="text-red-600 text-sm">Failed to load balances</div>}

        {balances && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {balances.map((balance) => (
              <BalanceCard key={balance.id} balance={balance} />
            ))}
          </div>
        )}
      </div>

      {/* Request history */}
      <div>
        <h2 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-4">My Requests</h2>

        {requestsLoading && <div className="text-gray-500 text-sm">Loading requests...</div>}
        {requestsError && <div className="text-red-600 text-sm">Failed to load requests</div>}

        {cancelRequest.isError && (
          <div className="text-red-600 text-sm mb-2">
            {getApiErrorMessage(cancelRequest.error, 'Failed to cancel request')}
          </div>
        )}

        {requests && requests.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            <Clock size={32} className="mx-auto mb-2 text-gray-300" />
            No time off requests yet
          </div>
        )}

        {requests && requests.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{req.timeOffTypeName}</td>
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
                    <td className="px-6 py-4">
                      {(req.status === 'PENDING' || req.status === 'APPROVED') && (
                        <button
                          onClick={() => handleCancel(req.id)}
                          disabled={cancelRequest.isPending}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                        >
                          <XCircle size={14} />
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <RequestTimeOffModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
