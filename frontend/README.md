# BonardaHR — Frontend

React 19 + TypeScript SPA for the BonardaHR system.

## Stack

- **React 19** with TypeScript (`verbatimModuleSyntax: true`)
- **Vite 7** — build tool and dev server
- **Tailwind CSS 4** — utility-first styling
- **React Router 7** — client-side routing via `createBrowserRouter`
- **React Query** (`@tanstack/react-query`) — server state, caching, mutations
- **React Hook Form + Zod** — form state and schema validation
- **Axios** — HTTP client with JWT interceptor
- **Lucide React** — icon library

## Architecture

```
src/
├── features/                    # Domain-specific feature modules
│   ├── auth/                    # Authentication
│   │   ├── components/          # LoginPage, ProtectedRoute
│   │   ├── context/             # AuthProvider + useAuth hook
│   │   ├── services/            # authService (login, me)
│   │   └── types/               # AuthResponse, AuthUser, DevLoginRequest
│   ├── employees/               # Employee management
│   │   ├── components/          # EmployeeList, EmployeeDetail, EmployeeForm, EmployeeHierarchy
│   │   ├── hooks/               # useEmployees, useEmployee, useCreateEmployee, ...
│   │   ├── services/            # employeeService (CRUD, sections, field values)
│   │   └── types/               # Employee, EmployeeHierarchy, section types
│   └── timeoff/                 # Time off management
│       ├── components/          # TimeOffPage, MyTimeOff, TeamTimeOff, AllTimeOff, modals
│       ├── hooks/               # useMyBalances, useTeamTimeOffRequests, useReviewTimeOffRequest, ...
│       ├── services/            # timeOffService (types, balances, requests)
│       └── types/               # TimeOffRequest, TimeOffBalance, TimeOffType
├── shared/
│   ├── components/
│   │   ├── layout/              # MainLayout, Sidebar, Header
│   │   └── ErrorBoundary.tsx    # React error boundary for render-time crashes
│   └── utils/
│       └── getApiErrorMessage.ts # Safe Axios error extraction
├── api/
│   └── apiClient.ts             # Axios instance with base URL and JWT interceptor
├── routes/
│   └── AppRoutes.tsx            # Route definitions
└── App.tsx                      # Root: QueryClientProvider → AuthProvider → RouterProvider
```

### Feature Module Convention

Each feature follows the same structure: `types/` → `services/` → `hooks/` → `components/`.

- **Types** — TypeScript interfaces for API request/response shapes
- **Services** — Thin wrappers around Axios calls (`GET /api/v1/employees` → `employeeService.getAll()`)
- **Hooks** — React Query `useQuery` / `useMutation` wrappers with cache invalidation
- **Components** — React components that consume hooks

This keeps API concerns out of components and makes each layer independently testable.

### State Management

| What | Where | Why |
|------|-------|-----|
| Server data (employees, time off, balances) | React Query | Automatic caching, revalidation, loading/error states |
| Auth state (token, current user, permissions) | React Context (`AuthProvider`) | Global, rarely changes, drives route protection |
| Form state | React Hook Form + Zod | Per-component, validation co-located with schema |
| UI state (modals, tabs) | `useState` | Local to component, no need to share |

### Authentication Flow

1. `LoginPage` renders a dropdown of dev employees (fetched from `/api/v1/auth/dev-employees`)
2. User selects an employee and submits → `POST /api/v1/auth/dev-login`
3. Backend returns JWT + user info → stored in `localStorage` and `AuthContext`
4. `apiClient` Axios interceptor attaches `Authorization: Bearer <token>` to every request
5. `ProtectedRoute` checks `AuthContext` — redirects to `/login` if unauthenticated
6. 401 responses trigger automatic logout via Axios response interceptor

### Routing

All authenticated routes are nested under `ProtectedRoute` → `MainLayout`:

| Path | Component | Access |
|------|-----------|--------|
| `/employees` | `EmployeeList` | All authenticated users |
| `/employees/new` | `EmployeeForm` | Users with `EMPLOYEE_CREATE` |
| `/employees/:id` | `EmployeeDetail` | All authenticated users |
| `/employees/:id/edit` | `EmployeeForm` | Users with `EMPLOYEE_UPDATE` |
| `/time-off` | `TimeOffPage` | All authenticated users (tabs filtered by role) |

### Error Handling

- **Render errors**: `ErrorBoundary` wraps the `<Outlet />` in `MainLayout`. If a component throws during render, the boundary shows a recovery UI while keeping the sidebar functional.
- **API errors**: `getApiErrorMessage()` uses `axios.isAxiosError()` to safely extract the server's error message, falling back to a generic string.
- **Mutation errors**: Displayed inline in modals/forms using the mutation's `error` state.

## Development

```bash
npm install           # Install dependencies
npm run dev           # Start dev server at http://localhost:5173
npx tsc --noEmit      # Type check (no output)
npm run build         # Production build to dist/
npm run lint          # ESLint
```

The dev server proxies API requests to `http://localhost:8081` (configured in `vite.config.ts` or via `VITE_API_URL` env var).

## Adding a New Feature

1. Create `src/features/<name>/types/<name>.types.ts` with request/response interfaces
2. Create `src/features/<name>/services/<name>Service.ts` with Axios calls
3. Create `src/features/<name>/hooks/use<Name>.ts` with React Query hooks
4. Create components in `src/features/<name>/components/`
5. Add route in `src/routes/AppRoutes.tsx`
6. Add sidebar link in `src/shared/components/layout/Sidebar.tsx`
