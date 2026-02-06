import { useState, useMemo, useRef, useEffect } from 'react';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useShareDocument } from '../hooks/useDocuments';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import apiClient from '../../../api/apiClient';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
}

interface ShareDocumentModalProps {
  docId: string;
  open: boolean;
  onClose: () => void;
}

export default function ShareDocumentModal({ docId, open, onClose }: ShareDocumentModalProps) {
  const shareDocument = useShareDocument();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);

  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'all-for-share'],
    queryFn: async () => {
      const res = await apiClient.get('/employees', { params: { page: 0, size: 100 } });
      return res.data;
    },
    enabled: open,
  });

  const employees: Employee[] = employeesData?.content || [];

  const grouped = useMemo(() => {
    const groups: Record<string, Employee[]> = {};
    employees.forEach((emp) => {
      const key = emp.position || 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(emp);
    });
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === 'Other') return 1;
      if (b === 'Other') return -1;
      return a.localeCompare(b);
    });
  }, [employees]);

  useEffect(() => {
    if (selectAllRef.current) {
      const allSelected = employees.length > 0 && selectedIds.length === employees.length;
      const someSelected = selectedIds.length > 0 && !allSelected;
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [selectedIds, employees]);

  if (!open) return null;

  const allSelected = employees.length > 0 && selectedIds.length === employees.length;

  const toggleEmployee = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(employees.map((e) => e.id));
    }
  };

  const toggleGroup = (groupEmployees: Employee[]) => {
    const groupIds = groupEmployees.map((e) => e.id);
    const allGroupSelected = groupIds.every((id) => selectedIds.includes(id));
    if (allGroupSelected) {
      setSelectedIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...groupIds])]);
    }
  };

  const toggleCollapse = (group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    try {
      await shareDocument.mutateAsync({ docId, data: { employeeIds: selectedIds } });
      setSelectedIds([]);
      onClose();
    } catch {
      // handled by mutation state
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Share Document</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-gray-600 mb-3">Select employees to share with:</p>

          <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg">
            {/* Select All - sticky */}
            <label className="flex items-center gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-10 cursor-pointer">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                Select All ({employees.length})
              </span>
            </label>

            {grouped.map(([group, groupEmployees]) => {
              const groupIds = groupEmployees.map((e) => e.id);
              const allGroupSelected = groupIds.every((id) => selectedIds.includes(id));
              const someGroupSelected = groupIds.some((id) => selectedIds.includes(id)) && !allGroupSelected;
              const isCollapsed = collapsedGroups.has(group);

              return (
                <div key={group}>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <button
                      type="button"
                      onClick={() => toggleCollapse(group)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <GroupCheckbox
                      checked={allGroupSelected}
                      indeterminate={someGroupSelected}
                      onChange={() => toggleGroup(groupEmployees)}
                    />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {group} ({groupEmployees.length})
                    </span>
                  </div>
                  {!isCollapsed &&
                    groupEmployees.map((emp) => (
                      <label
                        key={emp.id}
                        className="flex items-center gap-3 px-3 py-2 pl-10 hover:bg-gray-50 cursor-pointer border-b border-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(emp.id)}
                          onChange={() => toggleEmployee(emp.id)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-900">
                          {emp.firstName} {emp.lastName}
                        </span>
                      </label>
                    ))}
                </div>
              );
            })}
          </div>

          {shareDocument.isError && (
            <p className="text-sm text-red-600 mt-3">{getApiErrorMessage(shareDocument.error, 'Failed to share document')}</p>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedIds.length === 0 || shareDocument.isPending}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {shareDocument.isPending ? 'Sharing...' : `Share with ${selectedIds.length} employee${selectedIds.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GroupCheckbox({ checked, indeterminate, onChange }: { checked: boolean; indeterminate: boolean; onChange: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="rounded border-gray-300 cursor-pointer"
    />
  );
}
