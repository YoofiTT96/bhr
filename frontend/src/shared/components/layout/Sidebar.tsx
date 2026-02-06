import { NavLink, useNavigate } from 'react-router-dom';
import { Users, LayoutDashboard, Clock, Calendar, FolderKanban, Building2, FileText, Newspaper, LogOut, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../features/auth/context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employees', icon: Users, label: 'Employees' },
    { to: '/attendance', icon: Clock, label: 'Attendance' },
    { to: '/time-off', icon: Calendar, label: 'Time Off' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    ...(hasPermission('CLIENT_READ')
      ? [{ to: '/clients', icon: Building2, label: 'Clients' }]
      : []),
    { to: '/documents', icon: FileText, label: 'Documents' },
    { to: '/blog', icon: Newspaper, label: 'Blog', disabled: true },
    ...(hasPermission('ROLE_READ')
      ? [{ to: '/admin', icon: Shield, label: 'Admin' }]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoToProfile = () => {
    if (user) navigate(`/employees/${user.employeeId}`);
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 min-h-screen flex flex-col transition-all duration-200`}>
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className={`flex items-center ${collapsed ? 'justify-center p-4' : 'justify-between p-6'}`}>
          {collapsed ? (
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
              B
            </div>
          ) : (
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                <span className="text-blue-500">Bonarda</span>HR
              </h1>
              <p className="text-xs text-gray-500 mt-1">Human Resources</p>
            </div>
          )}
        </div>
        <div className={`flex ${collapsed ? 'justify-center' : 'justify-end'} px-3 pb-2`}>
          <button
            onClick={onToggle}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${collapsed ? 'px-2' : 'p-4'} py-4 space-y-1`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.disabled) {
            return (
              <div
                key={item.to}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 ${collapsed ? 'justify-center px-0' : 'px-3'} py-2 rounded-lg text-gray-400 cursor-not-allowed`}
              >
                <Icon size={20} />
                {!collapsed && (
                  <>
                    <span className="text-sm">{item.label}</span>
                    <span className="ml-auto text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                      Soon
                    </span>
                  </>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 ${collapsed ? 'justify-center px-0' : 'px-3'} py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User info and logout */}
      <div className={`${collapsed ? 'px-2' : 'px-4'} py-4 border-t border-gray-200`}>
        {user && (
          <button
            onClick={handleGoToProfile}
            title={collapsed ? user.name : 'Go to your profile'}
            className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-3'} w-full mb-3 rounded-lg py-2 hover:bg-gray-50 transition-colors`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium shrink-0">
              {user.name.split(' ').map((n) => n[0]).join('')}
            </div>
            {!collapsed && (
              <div className="min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.roles.join(', ')}</p>
              </div>
            )}
          </button>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'px-3'} py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 w-full transition-colors`}
        >
          <LogOut size={20} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
