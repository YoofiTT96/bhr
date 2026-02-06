import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FolderKanban } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import type { ProjectStatus } from '../types/project.types';

const statusStyles: Record<ProjectStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ON_HOLD: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AllProjects() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const { data, isLoading, isError } = useProjects(page);

  if (isLoading) {
    return <div className="text-gray-500 text-sm py-8">Loading projects...</div>;
  }

  if (isError) {
    return <div className="text-red-600 text-sm py-8">Failed to load projects</div>;
  }

  if (!data || data.content.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        <FolderKanban size={32} className="mx-auto mb-2 text-gray-300" />
        No projects found
      </div>
    );
  }

  return (
    <>
      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.content.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {project.name}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{project.clientName}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[project.status]}`}
                  >
                    {project.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{project.memberCount}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{project.totalHours}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{project.startDate || '—'}</td>
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

    </>
  );
}
