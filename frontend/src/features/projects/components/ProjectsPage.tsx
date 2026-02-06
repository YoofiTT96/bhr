import { useState } from 'react';
import { Plus } from 'lucide-react';
import Header from '../../../shared/components/layout/Header';
import { useAuth } from '../../auth/context/AuthContext';
import MyProjects from './MyProjects';
import AllProjects from './AllProjects';
import CreateProjectModal from './CreateProjectModal';

type Tab = 'my' | 'all';

export default function ProjectsPage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('my');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canViewAll = hasPermission('PROJECT_READ');
  const canCreate = hasPermission('PROJECT_CREATE');

  const tabs: { key: Tab; label: string; visible: boolean }[] = [
    { key: 'my', label: 'My Projects', visible: true },
    { key: 'all', label: 'All Projects', visible: canViewAll },
  ];

  const visibleTabs = tabs.filter((t) => t.visible);

  return (
    <>
      <Header title="Projects" />

      <div className="p-6">
        {/* Header row with tabs and create button */}
        <div className="flex items-end justify-between mb-6">
          {visibleTabs.length > 1 ? (
            <div className="border-b border-gray-200">
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
          ) : (
            <div />
          )}

          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Create Project
            </button>
          )}
        </div>

        {/* Tab content */}
        {activeTab === 'my' && <MyProjects />}
        {activeTab === 'all' && canViewAll && <AllProjects />}
      </div>

      <CreateProjectModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </>
  );
}
