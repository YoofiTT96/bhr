import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Plus, MapPin, Clock, UserX, Pencil, Trash2, FileSignature } from 'lucide-react';
import { useDashboardWeek, useDeleteEvent } from '../hooks/useDashboard';
import { usePendingSignatures } from '../../documents/hooks/useDocuments';
import { useAuth } from '../../auth/context/AuthContext';
import CreateEventModal from './CreateEventModal';
import EditEventModal from './EditEventModal';
import ClockInWidget from './ClockInWidget';
import { getEventTypeStyle } from '../constants';
import { getMonday, formatDate, formatTime, formatDateRange, formatWeekLabel } from '../../../shared/utils/dateUtils';
import type { CompanyEvent } from '../types/dashboard.types';
import type { TimeOffRequest } from '../../timeoff/types/timeoff.types';

export default function DashboardPage() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CompanyEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const deleteEvent = useDeleteEvent();
  const { data: pendingSignatures } = usePendingSignatures();

  const { monday, sunday, startDateStr, endDateStr } = useMemo(() => {
    const mon = getMonday(new Date());
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);
    return {
      monday: mon,
      sunday: sun,
      startDateStr: mon.toISOString().split('T')[0],
      endDateStr: sun.toISOString().split('T')[0],
    };
  }, []);

  const { data, isLoading, isError } = useDashboardWeek(startDateStr, endDateStr);

  const canCreateEvent = hasPermission('EVENT_CREATE');
  const canUpdateEvent = hasPermission('EVENT_UPDATE');
  const canDeleteEvent = hasPermission('EVENT_DELETE');

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent.mutateAsync(id);
    } finally {
      setDeletingEventId(null);
    }
  };

  // Group time-off requests by type
  const timeOffByType = useMemo(() => {
    if (!data?.approvedTimeOff) return new Map<string, TimeOffRequest[]>();
    const grouped = new Map<string, TimeOffRequest[]>();
    for (const req of data.approvedTimeOff) {
      const typeName = req.timeOffTypeName;
      if (!grouped.has(typeName)) {
        grouped.set(typeName, []);
      }
      grouped.get(typeName)!.push(req);
    }
    return grouped;
  }, [data?.approvedTimeOff]);

  const weekLabel = formatWeekLabel(monday, sunday);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Week of {weekLabel}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Failed to load dashboard data
        </div>
      ) : (
        <>
        {/* Clock In/Out Widget */}
        <ClockInWidget />

        {/* Pending Signatures */}
        {pendingSignatures && pendingSignatures.length > 0 && (
          <div className="bg-white rounded-lg border border-orange-200 shadow-sm mb-6">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-orange-200 bg-orange-50 rounded-t-lg">
              <FileSignature size={18} className="text-orange-600" />
              <h2 className="text-base font-semibold text-gray-900">
                Documents Awaiting Your Signature
              </h2>
              <span className="ml-auto text-xs font-medium text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                {pendingSignatures.length}
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {pendingSignatures.map((sig) => (
                <div
                  key={sig.id}
                  onClick={() => navigate(`/documents/${sig.documentId}`)}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{sig.documentTitle}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Requested {new Date(sig.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full">
                    Sign
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-blue-600" />
                <h2 className="text-base font-semibold text-gray-900">Upcoming Events</h2>
              </div>
              {canCreateEvent && (
                <button
                  onClick={() => setShowCreateEvent(true)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus size={16} />
                  Add Event
                </button>
              )}
            </div>
            <div className="p-5">
              {data?.upcomingEvents && data.upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {data.upcomingEvents.map((event: CompanyEvent) => {
                    const style = getEventTypeStyle(event.eventType);
                    return (
                      <div
                        key={event.id}
                        className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {event.title}
                            </h3>
                            {event.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <CalendarDays size={12} />
                                {formatDate(event.eventDate)}
                              </span>
                              {(event.startTime || event.endTime) && (
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {formatTime(event.startTime)}
                                  {event.endTime && ` - ${formatTime(event.endTime)}`}
                                </span>
                              )}
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} />
                                  {event.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text} whitespace-nowrap`}
                            >
                              {style.label}
                            </span>
                            {(canUpdateEvent || canDeleteEvent) && (
                              <div className="flex items-center gap-1">
                                {canUpdateEvent && (
                                  <button
                                    onClick={() => setEditingEvent(event)}
                                    className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                                    title="Edit event"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                )}
                                {canDeleteEvent && (
                                  <button
                                    onClick={() => setDeletingEventId(event.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                                    title="Delete event"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-gray-400">
                  <CalendarDays size={32} className="mx-auto mb-2 opacity-40" />
                  No events this week
                </div>
              )}
            </div>
          </div>

          {/* Who's Off This Week */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-200">
              <UserX size={18} className="text-orange-500" />
              <h2 className="text-base font-semibold text-gray-900">Who's Off This Week</h2>
            </div>
            <div className="p-5">
              {timeOffByType.size > 0 ? (
                <div className="space-y-4">
                  {Array.from(timeOffByType.entries()).map(([typeName, requests]) => (
                    <div key={typeName}>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {typeName}
                      </h3>
                      <div className="space-y-2">
                        {requests.map((req: TimeOffRequest) => (
                          <div
                            key={req.id}
                            className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                          >
                            <span className="text-sm font-medium text-gray-900">
                              {req.employeeName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDateRange(req.startDate, req.endDate)}
                              {req.halfDay && (
                                <span className="ml-1 text-gray-400">
                                  ({req.halfDayPeriod === 'MORNING' ? 'AM' : 'PM'})
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-gray-400">
                  <UserX size={32} className="mx-auto mb-2 opacity-40" />
                  No one is off this week
                </div>
              )}
            </div>
          </div>
        </div>
        </>
      )}

      <CreateEventModal open={showCreateEvent} onClose={() => setShowCreateEvent(false)} />
      <EditEventModal
        open={editingEvent !== null}
        event={editingEvent}
        onClose={() => setEditingEvent(null)}
      />

      {/* Delete Confirmation */}
      {deletingEventId && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setDeletingEventId(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Event</h3>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingEventId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingEventId)}
                disabled={deleteEvent.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteEvent.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
