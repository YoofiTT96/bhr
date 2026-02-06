# BonardaHR

Enterprise HR Management System built with React, Spring Boot, and PostgreSQL.

## Overview

BonardaHR is an HR management platform designed to handle employee management, leave workflows, and organizational structure. It follows a modular architecture where each HR domain (employees, time off, etc.) is a self-contained package with its own entities, services, controllers, and DTOs.

### Implemented

- **Employee Management** — CRUD, hierarchical reporting structure, configurable profile sections with JSONB dynamic fields
- **Time Off Management** — Configurable leave types, per-employee annual balances, request/approval workflow with half-day support
- **Role-Based Access Control** — Four default roles with granular resource-action permissions, plus an admin UI for managing custom roles and assigning roles to employees
- **Section Visibility** — Sensitive profile sections (payroll, emergency contacts) restricted by permission; self-view always allowed
- **Authentication** — JWT-based stateless auth with a dev-mode login endpoint (`@Profile("dev")`)

### Planned

- Microsoft Azure AD OAuth2 SSO (backend wiring exists, awaiting Azure credentials)
- Time & attendance tracking
- Project & client management
- Document signing via SharePoint integration
- Internal company blog
- Microsoft Calendar sync for approved time off

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2.2, Java 21, Spring Security, JPA/Hibernate |
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4 |
| Database | PostgreSQL 15+ with Flyway migrations |
| State | React Query (server state), React Context (auth) |
| Forms | React Hook Form + Zod validation |
| API | REST with `/api/v1/` versioning, JSON request/response |

## Project Structure

```
Nonnie-Claude/
├── backend/                          # Spring Boot application
│   └── src/main/java/.../bonarda/
│       ├── config/                   # CORS, security, dev data seeder
│       ├── domain/
│       │   ├── common/model/         # BaseEntity, AuditableEntity
│       │   ├── employee/             # Employee management domain
│       │   │   ├── model/            # Employee, EmployeeSection, SectionField, ...
│       │   │   ├── repository/
│       │   │   ├── service/
│       │   │   ├── controller/
│       │   │   └── dto/
│       │   ├── timeoff/              # Time off management domain
│       │   │   ├── model/            # TimeOffRequest, TimeOffType, TimeOffBalance, ...
│       │   │   ├── repository/
│       │   │   ├── service/
│       │   │   ├── controller/
│       │   │   └── dto/
│       │   └── admin/                # Roles & permissions admin
│       │       ├── service/          # RoleAdminService
│       │       ├── controller/       # RoleController, PermissionController, EmployeeRoleController
│       │       └── dto/
│       ├── security/                 # JWT, UserPrincipal, auth controllers
│       └── exception/                # GlobalExceptionHandler, custom exceptions
├── frontend/                         # React application
│   └── src/
│       ├── features/
│       │   ├── auth/                 # Login, AuthContext, ProtectedRoute
│       │   ├── employees/            # Employee list, detail, form, hierarchy
│       │   ├── timeoff/              # Balance cards, request modal, review workflow
│       │   └── admin/                # Roles & permissions admin UI
│       ├── shared/components/        # Layout (Sidebar, MainLayout), ErrorBoundary
│       ├── api/                      # Axios client with JWT interceptor
│       └── routes/                   # React Router configuration
├── docs/                             # Architecture documentation
│   ├── DECISIONS.md                  # Architectural Decision Records (ADR-001 through ADR-015)
│   └── DATABASE_SCHEMA.md           # Full schema documentation with ERD
└── docker/                           # Docker Compose for PostgreSQL
```

## Getting Started

### Prerequisites

- Java 21 JDK
- Node.js 20+
- PostgreSQL 15+ (or Docker)
- Maven 3.9+ (or use the included `./mvnw` wrapper)

### Quick Start

#### 1. Start PostgreSQL

```bash
cd docker
docker-compose -f docker-compose.dev.yml up -d
```

#### 2. Backend

```bash
cd backend
cp .env.example .env    # Edit with your DB credentials and JWT secret
./mvnw spring-boot:run  # Starts at http://localhost:8081
```

The backend runs with `spring.profiles.active=dev` by default, which seeds 10 sample employees, leave types, balances, and sample time off requests via `DevDataSeeder`.

#### 3. Frontend

```bash
cd frontend
npm install
npm run dev              # Starts at http://localhost:5173
```

### Dev Login

In dev mode, the login page shows a dropdown of seeded employees. Select one and click login — no password required. Each employee has a different role:

| Employee | Role | What you can do |
|----------|------|-----------------|
| Amara Osei (CEO) | ADMIN | Full access to everything |
| Esi Adjei (VP HR) | HR_MANAGER | Manage all employees and time off |
| Kofi Boateng (Eng Manager) | MANAGER | Approve team requests, view team |
| Yaw Asante (Developer) | EMPLOYEE | View own profile, request time off |

## Key Architecture

### Dual-Identifier Pattern

Every entity has an internal `BIGSERIAL id` (used for FKs, joins, JWT) and a `UUID public_id` (the only identifier exposed via the API). The mapping boundary is the service layer. See [ADR-012](docs/DECISIONS.md).

### Configurable Employee Sections

Employee profiles combine fixed columns (name, email, hire date) with dynamic JSONB-backed sections (payroll, emergency contacts, personal interests). Section field definitions live in `employee_sections` + `section_fields`; values in `employee_field_values`. See [ADR-001](docs/DECISIONS.md).

### Time Off Workflow

Requests follow a lifecycle: **PENDING** → **APPROVED** / **REJECTED** / **CANCELLED**. Balance counters (`pending`, `used`) are denormalized for O(1) reads and kept in sync across create, review, and cancel operations. Reviews use pessimistic locking to prevent double-approval races. See [ADR-013](docs/DECISIONS.md).

### Hierarchical Reporting

Self-referencing `reports_to_id` with circular reference prevention. The `buildHierarchy` method in `EmployeeServiceImpl` fetches the full employee list and builds the tree in-memory. This is an O(n) scan per level, acceptable for typical org structures (3-5 levels deep). For very deep hierarchies, consider replacing with a PostgreSQL recursive CTE.

### Roles & Permissions Admin

Admins can create/edit/delete custom roles, assign permissions to roles, and assign roles to employees — all from the `/admin` page (visible only to users with `ROLE_READ`). The four default roles (ADMIN, HR_MANAGER, MANAGER, EMPLOYEE) are protected from deletion. Permissions themselves are read-only in the UI; they're managed via Flyway migrations when new features are added. Role assignment is also available from each employee's detail page via the "Manage Roles" button (visible to users with `ROLE_ASSIGN`).

**Admin API endpoints:**

| Endpoint | Permission | Description |
|----------|-----------|-------------|
| `GET /api/v1/admin/roles` | ROLE_READ | List all roles with permissions |
| `POST /api/v1/admin/roles` | ROLE_CREATE | Create a new role |
| `PUT /api/v1/admin/roles/{id}` | ROLE_UPDATE | Update role name/description/permissions |
| `DELETE /api/v1/admin/roles/{id}` | ROLE_DELETE | Delete a custom role |
| `GET /api/v1/admin/permissions` | ROLE_READ | List all permissions |
| `GET /api/v1/admin/employees/{id}/roles` | ROLE_READ | Get an employee's roles |
| `PUT /api/v1/admin/employees/{id}/roles` | ROLE_ASSIGN | Set an employee's roles |

### Error Handling

Backend: `GlobalExceptionHandler` maps exceptions to consistent JSON responses without leaking internal details. Frontend: React `ErrorBoundary` wraps the content area to catch render errors; API errors extracted safely via `axios.isAxiosError()`. See [ADR-015](docs/DECISIONS.md).

## Documentation

- **[Architectural Decision Records](docs/DECISIONS.md)** — 15 ADRs covering all major design choices
- **[Database Schema](docs/DATABASE_SCHEMA.md)** — Full table documentation, ERD, indexes, constraints, migration history

## Development Commands

### Backend

```bash
cd backend
./mvnw spring-boot:run     # Run with dev profile
./mvnw compile -q           # Quick compile check
./mvnw test                 # Run tests
./mvnw clean package        # Production build
```

### Frontend

```bash
cd frontend
npm run dev                 # Dev server with HMR
npx tsc --noEmit            # Type check
npm run build               # Production build
npm run lint                # ESLint
```

## Database Migrations

Schema changes are managed with Flyway. Migrations run automatically on startup.

```
backend/src/main/resources/db/migration/
├── V1__create_employee_tables.sql          # Core schema
├── V2__add_section_visibility.sql          # Section permissions
├── V3__add_employee_public_id.sql          # UUID public identifiers
├── V4__create_time_off_tables.sql          # Time off management
├── V5__grant_employee_read_all_to_employee_role.sql
├── V6__fix_time_off_constraints.sql        # Partial unique index, balance integrity
└── V7__add_role_permission_admin.sql       # public_id on roles/permissions, admin permissions
```

Never modify an existing migration — always create a new `V{next}__description.sql` file.

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## Future
1. Integration with klokin klokaut

## License

Copyright 2026 Turntabl. All rights reserved.
