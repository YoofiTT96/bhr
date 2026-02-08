import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../shared/components/layout/MainLayout';
import ProtectedRoute from '../features/auth/components/ProtectedRoute';
import PermissionGuard from '../features/auth/components/PermissionGuard';
import LoginPage from '../features/auth/components/LoginPage';
import AuthCallbackPage from '../features/auth/components/AuthCallbackPage';
import EmployeeList from '../features/employees/components/EmployeeList';
import EmployeeDetail from '../features/employees/components/EmployeeDetail';
import EmployeeForm from '../features/employees/components/EmployeeForm';
import TimeOffPage from '../features/timeoff/components/TimeOffPage';
import AdminPage from '../features/admin/components/AdminPage';
import AttendancePage from '../features/attendance/components/AttendancePage';
import TimesheetDetail from '../features/attendance/components/TimesheetDetail';
import ProjectsPage from '../features/projects/components/ProjectsPage';
import ProjectDetail from '../features/projects/components/ProjectDetail';
import ClientsPage from '../features/projects/components/ClientsPage';
import ClientDetail from '../features/projects/components/ClientDetail';
import DocumentsPage from '../features/documents/components/DocumentsPage';
import DocumentDetail from '../features/documents/components/DocumentDetail';
import DashboardPage from '../features/dashboard/components/DashboardPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/employees', element: <EmployeeList /> },
          { path: '/employees/new', element: <PermissionGuard permission="EMPLOYEE_CREATE"><EmployeeForm /></PermissionGuard> },
          { path: '/employees/:id', element: <EmployeeDetail /> },
          { path: '/employees/:id/edit', element: <PermissionGuard permission="EMPLOYEE_UPDATE"><EmployeeForm /></PermissionGuard> },
          { path: '/time-off', element: <TimeOffPage /> },
          { path: '/attendance', element: <AttendancePage /> },
          { path: '/attendance/:id', element: <TimesheetDetail /> },
          { path: '/projects', element: <ProjectsPage /> },
          { path: '/projects/:id', element: <ProjectDetail /> },
          { path: '/clients', element: <PermissionGuard permission="CLIENT_READ"><ClientsPage /></PermissionGuard> },
          { path: '/clients/:id', element: <PermissionGuard permission="CLIENT_READ"><ClientDetail /></PermissionGuard> },
          { path: '/documents', element: <DocumentsPage /> },
          { path: '/documents/:id', element: <DocumentDetail /> },
          { path: '/admin', element: <PermissionGuard permission="ADMIN_ACCESS"><AdminPage /></PermissionGuard> },
        ],
      },
    ],
  },
]);
