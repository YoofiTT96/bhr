import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Users, Edit, Shield } from 'lucide-react';
import { useEmployee, useDirectReports } from '../hooks/useEmployees';
import { useVisibleSections } from '../hooks/useEmployeeSections';
import Header from '../../../shared/components/layout/Header';
import ConfigurableSection from './ConfigurableSection';
import AssignRolesModal from '../../admin/components/AssignRolesModal';
import { useAuth } from '../../auth/context/AuthContext';
import { useState } from 'react';
import type { EmployeeStatus } from '../types/employee.types';

const statusColors: Record<EmployeeStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
  ON_LEAVE: 'bg-yellow-100 text-yellow-700',
  TERMINATED: 'bg-red-100 text-red-700',
};

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const employeeId = id!;
  const { hasPermission } = useAuth();
  const { data: employee, isLoading } = useEmployee(employeeId);
  const { data: directReports } = useDirectReports(employeeId);
  const { data: sections } = useVisibleSections(employeeId);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showAssignRoles, setShowAssignRoles] = useState(false);

  const canAssignRoles = hasPermission('ROLE_ASSIGN');

  if (isLoading) {
    return (
      <>
        <Header title="Employee" />
        <div className="flex items-center justify-center py-20 text-gray-500">Loading...</div>
      </>
    );
  }

  if (!employee) {
    return (
      <>
        <Header title="Employee" />
        <div className="flex items-center justify-center py-20 text-red-500">Employee not found</div>
      </>
    );
  }

  return (
    <>
      <Header title={`${employee.firstName} ${employee.lastName}`} />

      <div className="p-6 space-y-6">
        {/* Back link */}
        <Link to="/employees" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} />
          Back to employees
        </Link>

        {/* Profile card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-semibold">
                {employee.firstName[0]}
                {employee.lastName[0]}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {employee.firstName} {employee.lastName}
                </h3>
                <p className="text-gray-600">{employee.position || 'No position set'}</p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium ${statusColors[employee.status]}`}
                >
                  {employee.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canAssignRoles && (
                <button
                  onClick={() => setShowAssignRoles(true)}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5"
                >
                  <Shield size={14} />
                  Manage Roles
                </button>
              )}
              <Link
                to={`/employees/${employee.id}/edit`}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5"
              >
                <Edit size={14} />
                Edit
              </Link>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-100">
            <InfoItem icon={Mail} label="Email" value={employee.email} />
            <InfoItem icon={Phone} label="Phone" value={employee.phoneNumber || '—'} />
            <InfoItem icon={MapPin} label="Location" value={employee.location || '—'} />
            <InfoItem
              icon={Calendar}
              label="Hire Date"
              value={new Date(employee.hireDate).toLocaleDateString()}
            />
            <InfoItem
              icon={Calendar}
              label="Birthday"
              value={employee.birthday ? new Date(employee.birthday).toLocaleDateString() : '—'}
            />
            <InfoItem
              icon={Users}
              label="Reports To"
              value={employee.reportsToName || 'No manager'}
            />
            <InfoItem
              icon={Calendar}
              label="Tenure"
              value={
                employee.tenure.years > 0
                  ? `${employee.tenure.years} years, ${employee.tenure.months} months`
                  : `${employee.tenure.months} months, ${employee.tenure.days} days`
              }
            />
            <InfoItem
              icon={Users}
              label="Direct Reports"
              value={String(employee.directReportCount)}
            />
          </div>
        </div>

        {/* Direct reports */}
        {directReports && directReports.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Direct Reports</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {directReports.map((report) => (
                <Link
                  key={report.id}
                  to={`/employees/${report.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium">
                    {report.firstName[0]}
                    {report.lastName[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {report.firstName} {report.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{report.position}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Configurable sections */}
        {sections && sections.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Additional Information</h4>

            <div className="flex gap-2 mb-4 border-b border-gray-100 pb-3">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() =>
                    setActiveSection(activeSection === section.name ? null : section.name)
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    activeSection === section.name
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {section.displayName}
                </button>
              ))}
            </div>

            {activeSection && (
              <ConfigurableSection employeeId={employeeId} sectionName={activeSection} />
            )}
          </div>
        )}

        {showAssignRoles && (
          <AssignRolesModal
            employeeId={employeeId}
            employeeName={`${employee.firstName} ${employee.lastName}`}
            onClose={() => setShowAssignRoles(false)}
          />
        )}
      </div>
    </>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={16} className="text-gray-400 mt-0.5" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  );
}
