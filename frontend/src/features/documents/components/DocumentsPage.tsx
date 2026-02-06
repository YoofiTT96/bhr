import { useState } from 'react';
import { Plus } from 'lucide-react';
import Header from '../../../shared/components/layout/Header';
import { useAuth } from '../../auth/context/AuthContext';
import CompanyDocuments from './CompanyDocuments';
import MyDocuments from './MyDocuments';
import MyUploads from './MyUploads';
import AllDocuments from './AllDocuments';
import CreateDocumentModal from './CreateDocumentModal';

type Tab = 'company' | 'my' | 'uploads' | 'all';

export default function DocumentsPage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('company');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canViewAll = hasPermission('DOCUMENT_READ_ALL');
  const canCreate = hasPermission('DOCUMENT_CREATE');

  const tabs: { key: Tab; label: string; visible: boolean }[] = [
    { key: 'company', label: 'Company Documents', visible: true },
    { key: 'my', label: 'My Documents', visible: true },
    { key: 'uploads', label: 'My Uploads', visible: true },
    { key: 'all', label: 'All Documents', visible: canViewAll },
  ];

  const visibleTabs = tabs.filter((t) => t.visible);

  return (
    <>
      <Header title="Documents" />

      <div className="p-6">
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
              Add Document
            </button>
          )}
        </div>

        {activeTab === 'company' && <CompanyDocuments />}
        {activeTab === 'my' && <MyDocuments />}
        {activeTab === 'uploads' && <MyUploads />}
        {activeTab === 'all' && canViewAll && <AllDocuments />}
      </div>

      <CreateDocumentModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </>
  );
}
