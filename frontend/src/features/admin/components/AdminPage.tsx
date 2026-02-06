import { useState } from 'react';
import Header from '../../../shared/components/layout/Header';
import RolesTab from './RolesTab';
import PermissionsTab from './PermissionsTab';
import TimeOffTypesTab from './TimeOffTypesTab';
import DepartmentsTab from './DepartmentsTab';
import PositionsTab from './PositionsTab';

type Tab = 'roles' | 'permissions' | 'timeoff' | 'departments' | 'positions';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('roles');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'roles', label: 'Roles' },
    { key: 'permissions', label: 'Permissions' },
    { key: 'timeoff', label: 'Time Off Types' },
    { key: 'departments', label: 'Departments' },
    { key: 'positions', label: 'Positions' },
  ];

  return (
    <>
      <Header title="Admin" />

      <div className="p-6">
        <div className="border-b border-gray-200 mb-6">
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

        {activeTab === 'roles' && <RolesTab />}
        {activeTab === 'permissions' && <PermissionsTab />}
        {activeTab === 'timeoff' && <TimeOffTypesTab />}
        {activeTab === 'departments' && <DepartmentsTab />}
        {activeTab === 'positions' && <PositionsTab />}
      </div>
    </>
  );
}
