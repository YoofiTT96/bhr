import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import Header from '../../../shared/components/layout/Header';
import { useAuth } from '../../auth/context/AuthContext';
import { useTimesheet, useSubmitTimesheet } from '../hooks/useAttendance';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import WeeklyGrid from './WeeklyGrid';
import type { TimesheetStatus } from '../types/attendance.types';

const statusStyles: Record<TimesheetStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

function isWithinEditWindow(weekStart: string): boolean {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const currentMonday = new Date(now);
  currentMonday.setDate(now.getDate() + diff);
  currentMonday.setHours(0, 0, 0, 0);

  const cutoff = new Date(currentMonday);
  cutoff.setDate(cutoff.getDate() - 14); // 2 weeks ago

  const weekStartDate = new Date(weekStart + 'T00:00:00');
  return weekStartDate >= cutoff;
}

export default function TimesheetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: timesheet, isLoading, isError } = useTimesheet(id!);
  const submitMutation = useSubmitTimesheet();

  if (isLoading) {
    return (
      <>
        <Header title="Timesheet" />
        <div className="p-6 text-gray-500 text-sm">Loading timesheet...</div>
      </>
    );
  }

  if (isError || !timesheet) {
    return (
      <>
        <Header title="Timesheet" />
        <div className="p-6 text-red-600 text-sm">Failed to load timesheet</div>
      </>
    );
  }

  const isOwner = timesheet.employeeId === user?.employeeId;
  const withinWindow = isWithinEditWindow(timesheet.weekStart);
  const canEdit = isOwner && withinWindow && (timesheet.status === 'DRAFT' || timesheet.status === 'REJECTED');
  const canSubmit = isOwner && withinWindow && (timesheet.status === 'DRAFT' || timesheet.status === 'REJECTED');

  const handleSubmit = async () => {
    if (window.confirm('Submit this timesheet for approval? You will not be able to edit it after submission.')) {
      try {
        await submitMutation.mutateAsync(timesheet.id);
      } catch {
        // Error handled by mutation state
      }
    }
  };

  return (
    <>
      <Header title="Timesheet" />

      <div className="p-6 space-y-6">
        {/* Back + header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/attendance')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {timesheet.employeeName} — Week of {timesheet.weekStart}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[timesheet.status]}`}>
                  {timesheet.status}
                </span>
                <span className="text-sm text-gray-500">{timesheet.totalHours}h total</span>
              </div>
            </div>
          </div>

          {canSubmit && (
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
              {submitMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
            </button>
          )}
        </div>

        {submitMutation.isError && (
          <div className="text-sm text-red-600">
            {getApiErrorMessage(submitMutation.error, 'Failed to submit timesheet')}
          </div>
        )}

        {/* Edit window expired notice */}
        {isOwner && !withinWindow && (timesheet.status === 'DRAFT' || timesheet.status === 'REJECTED') && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              This timesheet is older than 2 weeks and can no longer be edited or submitted.
            </p>
          </div>
        )}

        {/* Rejection note */}
        {timesheet.status === 'REJECTED' && timesheet.reviewNote && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Rejected by {timesheet.reviewerName}</p>
              <p className="text-sm text-red-700 mt-1">{timesheet.reviewNote}</p>
            </div>
          </div>
        )}

        {/* Approval note */}
        {timesheet.status === 'APPROVED' && (
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
            <div>
              <p className="text-sm font-medium text-green-800">Approved by {timesheet.reviewerName}</p>
              {timesheet.reviewNote && (
                <p className="text-sm text-green-700 mt-1">{timesheet.reviewNote}</p>
              )}
            </div>
          </div>
        )}

        {/* Weekly grid */}
        <WeeklyGrid timesheet={timesheet} editable={canEdit} />
      </div>
    </>
  );
}
