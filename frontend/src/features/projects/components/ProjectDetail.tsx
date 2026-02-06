import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Clock, Pencil } from 'lucide-react';
import Header from '../../../shared/components/layout/Header';
import { useAuth } from '../../auth/context/AuthContext';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import {
  useProject,
  useProjectAssignments,
  useProjectTimeLogs,
  useRemoveAssignment,
} from '../hooks/useProjects';
import AssignMemberModal from './AssignMemberModal';
import LogTimeModal from './LogTimeModal';
import EditProjectModal from './EditProjectModal';
import type { ProjectStatus, ProjectAssignmentRole } from '../types/project.types';

type SubTab = 'overview' | 'members' | 'time-logs';

const statusColors: Record<ProjectStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ON_HOLD: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const roleColors: Record<ProjectAssignmentRole, string> = {
  LEAD: 'bg-blue-100 text-blue-700',
  MEMBER: 'bg-gray-100 text-gray-700',
};

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  const { data: project, isLoading, isError, error } = useProject(id!);
  const { data: assignments } = useProjectAssignments(id!);
  const { data: timeLogs } = useProjectTimeLogs(id!);

  const removeAssignment = useRemoveAssignment();

  const [activeTab, setActiveTab] = useState<SubTab>('overview');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showLogTimeModal, setShowLogTimeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const canAssign = hasPermission('PROJECT_ASSIGN');
  const canUpdate = hasPermission('PROJECT_UPDATE');
  const isAssigned = assignments?.some((a) => a.employeeId === user?.employeeId) ?? false;

  const tabs: { key: SubTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'members', label: 'Members' },
    { key: 'time-logs', label: 'Time Logs' },
  ];

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await removeAssignment.mutateAsync({ projectId: id!, assignmentId });
    } catch {
      // Error handled by mutation state
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Project" />
        <div className="flex items-center justify-center py-20 text-gray-500">Loading project...</div>
      </>
    );
  }

  if (isError || !project) {
    return (
      <>
        <Header title="Project" />
        <div className="flex items-center justify-center py-20 text-red-500">
          {getApiErrorMessage(error, 'Failed to load project')}
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={project.name} />

      <div className="p-6 space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to projects
        </button>

        {/* Header area */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{project.clientName}</p>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}
                >
                  {project.status.replace('_', ' ')}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock size={14} />
                  {project.totalHours}h total
                </span>
              </div>
            </div>

            {canUpdate && (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-sm text-gray-900 mt-1">{project.description || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="text-sm text-gray-900 mt-1">
                  {project.budget != null ? formatCurrency(project.budget) : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="text-sm text-gray-900 mt-1">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="text-sm text-gray-900 mt-1">
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Hours</p>
                <p className="text-sm text-gray-900 mt-1">{project.totalHours}h</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Members</p>
                <p className="text-sm text-gray-900 mt-1">{project.memberCount}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-4">
            {canAssign && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  Assign Member
                </button>
              </div>
            )}

            {removeAssignment.isError && (
              <div className="text-sm text-red-600">
                {getApiErrorMessage(removeAssignment.error, 'Failed to remove assignment')}
              </div>
            )}

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
                      Role
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours Logged
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Date
                    </th>
                    {canAssign && (
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignments && assignments.length > 0 ? (
                    assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {assignment.employeeName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {assignment.employeePosition || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[assignment.role]}`}
                          >
                            {assignment.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {assignment.hoursLogged}h
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(assignment.assignedAt).toLocaleDateString()}
                        </td>
                        {canAssign && (
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleRemoveAssignment(assignment.id)}
                              disabled={removeAssignment.isPending}
                              className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Remove member"
                            >
                              <X size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={canAssign ? 6 : 5}
                        className="px-6 py-10 text-center text-sm text-gray-500"
                      >
                        No members assigned to this project
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'time-logs' && (
          <div className="space-y-4">
            {isAssigned && (
              <div className="flex justify-end">
                <button
                  onClick={() => setShowLogTimeModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  Log Time
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {timeLogs && timeLogs.length > 0 ? (
                    timeLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(log.logDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {log.employeeName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{log.hours}h</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {log.description || '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                        No time logs recorded for this project
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AssignMemberModal
        open={showAssignModal}
        projectId={id!}
        onClose={() => setShowAssignModal(false)}
      />

      <LogTimeModal
        open={showLogTimeModal}
        projectId={id!}
        onClose={() => setShowLogTimeModal(false)}
      />

      <EditProjectModal
        open={showEditModal}
        project={project}
        onClose={() => setShowEditModal(false)}
      />
    </>
  );
}
