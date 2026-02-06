import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight, Upload, List, LayoutGrid, ChevronDown, ChevronUp } from 'lucide-react';
import { useEmployees } from '../hooks/useEmployees';
import { useAuth } from '../../auth/context/AuthContext';
import Header from '../../../shared/components/layout/Header';
import BulkImportModal from './BulkImportModal';
import type { Employee, EmployeeStatus } from '../types/employee.types';

type ViewMode = 'list' | 'grouped';

const statusColors: Record<EmployeeStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
  ON_LEAVE: 'bg-yellow-100 text-yellow-700',
  TERMINATED: 'bg-red-100 text-red-700',
};

const statusLabels: Record<EmployeeStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ON_LEAVE: 'On Leave',
  TERMINATED: 'Terminated',
};

export default function EmployeeList() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [expandedPositions, setExpandedPositions] = useState<Set<string>>(new Set());
  const { data, isLoading, isError } = useEmployees(page, 20);
  const { hasPermission } = useAuth();
  const canCreateEmployee = hasPermission('EMPLOYEE_CREATE');

  const filteredEmployees = data?.content.filter((emp) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      emp.firstName.toLowerCase().includes(q) ||
      emp.lastName.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.position?.toLowerCase().includes(q) ||
      emp.departmentName?.toLowerCase().includes(q)
    );
  });

  // Group employees by position
  const groupedByPosition = useMemo(() => {
    if (!filteredEmployees) return new Map<string, Employee[]>();

    const groups = new Map<string, Employee[]>();
    filteredEmployees.forEach((emp) => {
      const position = emp.position || 'No Position';
      if (!groups.has(position)) {
        groups.set(position, []);
      }
      groups.get(position)!.push(emp);
    });

    // Sort positions alphabetically, with "No Position" at the end
    return new Map(
      [...groups.entries()].sort((a, b) => {
        if (a[0] === 'No Position') return 1;
        if (b[0] === 'No Position') return -1;
        return a[0].localeCompare(b[0]);
      })
    );
  }, [filteredEmployees]);

  const togglePosition = (position: string) => {
    setExpandedPositions((prev) => {
      const next = new Set(prev);
      if (next.has(position)) {
        next.delete(position);
      } else {
        next.add(position);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedPositions(new Set(groupedByPosition.keys()));
  };

  const collapseAll = () => {
    setExpandedPositions(new Set());
  };

  return (
    <>
      <Header title="Employees" />

      <div className="p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filter employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
              />
            </div>

            {/* View toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title="List view"
              >
                <List size={16} />
                List
              </button>
              <button
                onClick={() => {
                  setViewMode('grouped');
                  expandAll();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'grouped'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title="Group by position"
              >
                <LayoutGrid size={16} />
                By Position
              </button>
            </div>
          </div>

          {canCreateEmployee && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setImportModalOpen(true)}
                className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <Upload size={18} />
                Import CSV
              </button>
              <Link
                to="/employees/new"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                Add Employee
              </Link>
            </div>
          )}
        </div>

        {/* Table */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-gray-500">Loading employees...</div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-20 text-red-500">
            Failed to load employees. Is the backend running?
          </div>
        )}

        {data && viewMode === 'list' && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reports To
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenure
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEmployees?.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/employees/${employee.id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-medium">
                            {employee.firstName[0]}
                            {employee.lastName[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{employee.email}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee.position || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee.departmentName || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee.location || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee.reportsToName || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[employee.status]}`}
                        >
                          {statusLabels[employee.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee.tenure.years > 0
                          ? `${employee.tenure.years}y ${employee.tenure.months}m`
                          : `${employee.tenure.months}m`}
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
                {Math.min((data.number + 1) * data.size, data.totalElements)} of{' '}
                {data.totalElements}
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
          </>
        )}

        {data && viewMode === 'grouped' && (
          <>
            {/* Expand/Collapse controls */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={expandAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Expand all
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={collapseAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Collapse all
              </button>
              <span className="text-sm text-gray-500 ml-4">
                {groupedByPosition.size} position{groupedByPosition.size !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Grouped cards */}
            <div className="space-y-4">
              {[...groupedByPosition.entries()].map(([position, employees]) => {
                const isExpanded = expandedPositions.has(position);
                return (
                  <div
                    key={position}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    {/* Position header */}
                    <button
                      onClick={() => togglePosition(position)}
                      className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">{position}</span>
                        <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                          {employees.length} employee{employees.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </button>

                    {/* Employees in this position */}
                    {isExpanded && (
                      <div className="divide-y divide-gray-100">
                        {employees.map((employee) => (
                          <Link
                            key={employee.id}
                            to={`/employees/${employee.id}`}
                            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-medium">
                                {employee.firstName[0]}
                                {employee.lastName[0]}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {employee.firstName} {employee.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{employee.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="text-gray-600 w-24">
                                {employee.departmentName || '—'}
                              </div>
                              <div className="text-gray-600 w-24">
                                {employee.location || '—'}
                              </div>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[employee.status]}`}
                              >
                                {statusLabels[employee.status]}
                              </span>
                              <div className="text-gray-500 w-16 text-right">
                                {employee.tenure.years > 0
                                  ? `${employee.tenure.years}y ${employee.tenure.months}m`
                                  : `${employee.tenure.months}m`}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination for grouped view */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>
                Showing {data.number * data.size + 1}–
                {Math.min((data.number + 1) * data.size, data.totalElements)} of{' '}
                {data.totalElements}
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
          </>
        )}
      </div>

      <BulkImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
      />
    </>
  );
}
