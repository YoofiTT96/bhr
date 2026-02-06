import { useState } from 'react';
import Header from '../../../shared/components/layout/Header';
import { useAuth } from '../../auth/context/AuthContext';
import MyTimeOff from './MyTimeOff';
import TeamTimeOff from './TeamTimeOff';
import AllTimeOff from './AllTimeOff';

type Tab = 'my' | 'team' | 'all';

export default function TimeOffPage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('my');

  const canViewTeam = hasPermission('TIME_OFF_REQUEST_READ_TEAM');
  const canViewAll = hasPermission('TIME_OFF_REQUEST_READ_ALL');

  const tabs: { key: Tab; label: string; visible: boolean }[] = [
    { key: 'my', label: 'My Time Off', visible: true },
    { key: 'team', label: 'Team Requests', visible: canViewTeam },
    { key: 'all', label: 'All Requests', visible: canViewAll },
  ];

  const visibleTabs = tabs.filter((t) => t.visible);

  return (
    <>
      <Header title="Time Off" />

      <div className="p-6">
        {/* Tabs */}
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

        {/* Tab content */}
        {activeTab === 'my' && <MyTimeOff />}
        {activeTab === 'team' && canViewTeam && <TeamTimeOff />}
        {activeTab === 'all' && canViewAll && <AllTimeOff />}
      </div>
    </>
  );
}
