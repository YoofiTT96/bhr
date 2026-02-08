import { useState, useEffect } from 'react';
import Header from '../../../shared/components/layout/Header';
import { useAuth } from '../../auth/context/AuthContext';
import RolesTab from './RolesTab';
import PermissionsTab from './PermissionsTab';
import TimeOffTypesTab from './TimeOffTypesTab';
import DepartmentsTab from './DepartmentsTab';
import PositionsTab from './PositionsTab';
import SectionsTab from './SectionsTab';

type Tab = 'roles' | 'permissions' | 'timeoff' | 'departments' | 'positions' | 'sections';

interface TabConfig {
  key: Tab;
  label: string;
  permission: string;
}

export default function AdminPage() {
  const { hasPermission } = useAuth();

  // Super Admin (has ROLE_READ) sees ONLY Roles & Permissions
  const isSuperAdmin = hasPermission('ROLE_READ');

  // Define tabs based on admin type
  const superAdminTabs: TabConfig[] = [
    { key: 'roles', label: 'Roles', permission: 'ROLE_READ' },
    { key: 'permissions', label: 'Permissions', permission: 'ROLE_READ' },
  ];

  const operationalAdminTabs: TabConfig[] = [
    { key: 'timeoff', label: 'Time Off Types', permission: 'TIME_OFF_TYPE_READ' },
    { key: 'departments', label: 'Departments', permission: 'DEPARTMENT_READ' },
    { key: 'positions', label: 'Positions', permission: 'POSITION_READ' },
    { key: 'sections', label: 'Sections', permission: 'SECTION_READ' },
  ];

  // Super Admin sees only super admin tabs, otherwise show operational tabs based on permissions
  const visibleTabs = isSuperAdmin
    ? superAdminTabs
    : operationalAdminTabs.filter((tab) => hasPermission(tab.permission));

  // Default to first available tab
  const [activeTab, setActiveTab] = useState<Tab | null>(null);

  useEffect(() => {
    if (visibleTabs.length > 0 && (!activeTab || !visibleTabs.some(t => t.key === activeTab))) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [visibleTabs, activeTab]);

  if (visibleTabs.length === 0) {
    return (
      <>
        <Header title="Admin" />
        <div className="p-6 text-center text-gray-500">
          You don't have permission to access any admin features.
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Admin" />

      <div className="p-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-6">
            {visibleTabs.map((tab) => (
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

        {activeTab === 'roles' && <RolesTab />}
        {activeTab === 'permissions' && <PermissionsTab />}
        {activeTab === 'timeoff' && <TimeOffTypesTab />}
        {activeTab === 'departments' && <DepartmentsTab />}
        {activeTab === 'positions' && <PositionsTab />}
        {activeTab === 'sections' && <SectionsTab />}
      </div>
    </>
  );
}
