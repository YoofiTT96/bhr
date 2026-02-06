import { useState } from 'react';
import Header from '../../../shared/components/layout/Header';
import { useAuth } from '../../auth/context/AuthContext';
import MyTimesheets from './MyTimesheets';
import TeamTimesheets from './TeamTimesheets';
import AllTimesheets from './AllTimesheets';

type Tab = 'my' | 'team' | 'all';

export default function AttendancePage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('my');

  const canViewTeam = hasPermission('TIMESHEET_READ_TEAM');
  const canViewAll = hasPermission('TIMESHEET_READ_ALL');

  const tabs: { key: Tab; label: string; visible: boolean }[] = [
    { key: 'my', label: 'My Timesheets', visible: true },
    { key: 'team', label: 'Team Timesheets', visible: canViewTeam },
    { key: 'all', label: 'All Timesheets', visible: canViewAll },
  ];

  const visibleTabs = tabs.filter((t) => t.visible);

  return (
    <>
      <Header title="Attendance" />

      <div className="p-6">
        {visibleTabs.length > 1 && (
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
        )}

        {activeTab === 'my' && <MyTimesheets />}
        {activeTab === 'team' && canViewTeam && <TeamTimesheets />}
        {activeTab === 'all' && canViewAll && <AllTimesheets />}
      </div>
    </>
  );
}
