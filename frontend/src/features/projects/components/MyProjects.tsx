import { useNavigate } from 'react-router-dom';
import { FolderKanban, Users, Clock } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { useMyProjects } from '../hooks/useProjects';
import type { ProjectStatus, ProjectAssignmentRole } from '../types/project.types';

const statusStyles: Record<ProjectStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ON_HOLD: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const roleStyles: Record<ProjectAssignmentRole, string> = {
  LEAD: 'bg-blue-100 text-blue-700',
  MEMBER: 'bg-gray-100 text-gray-700',
};

export default function MyProjects() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: projects, isLoading, isError } = useMyProjects();

  if (isLoading) {
    return <div className="text-gray-500 text-sm py-8">Loading your projects...</div>;
  }

  if (isError) {
    return <div className="text-red-600 text-sm py-8">Failed to load projects</div>;
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        <FolderKanban size={32} className="mx-auto mb-2 text-gray-300" />
        No projects assigned yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => {
        const assignment = project.assignments?.find(
          (a) => a.employeeId === user?.employeeId,
        );
        const role = assignment?.role;

        return (
          <div
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            className="bg-white rounded-lg border border-gray-200 p-5 cursor-pointer hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-900">{project.name}</h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[project.status]}`}
              >
                {project.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-3">{project.clientName}</p>

            {role && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-3 ${roleStyles[role]}`}
              >
                {role}
              </span>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {project.totalHours}h
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} />
                {project.memberCount} member{project.memberCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
