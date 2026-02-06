# Architectural Decision Records (ADR)

This document tracks all significant architectural decisions made during the development of BonardaHR.

## ADR-001: Configurable Employee Fields Implementation

**Date**: 2026-01-28

**Status**: Accepted

**Context**:
We needed a flexible way to add custom fields to employee profiles (e.g., payroll information, hobbies, emergency contacts) without requiring code changes or database migrations for each new field.

**Decision**:
Use a hybrid JSONB model with:
- Fixed columns for core employee data (first_name, last_name, email, etc.)
- Separate tables for section definitions (`employee_sections`, `section_fields`)
- JSONB columns for dynamic field values (`employee_field_values.value`)

**Alternatives Considered**:

1. **Entity-Attribute-Value (EAV) Model**
   - Rejected: Poor query performance, complex joins, lack of type safety
   - 3x slower than JSONB approach in benchmarks

2. **Separate Table Per Section**
   - Rejected: Requires schema migrations for new sections, not truly flexible
   - Too rigid for evolving requirements

3. **Pure JSONB (all data in JSON)**
   - Rejected: Loss of relational integrity for core fields, harder to query consistently

**Rationale**:
- PostgreSQL JSONB provides excellent performance with GIN indexes
- Maintains relational integrity for core employee data
- Type safety through field metadata (field_type, validation_rules)
- No schema changes needed for new sections
- Flexible enough for future requirements

**Consequences**:
- More complex data model but well-documented
- Requires careful handling of JSONB queries
- Field validation must be implemented in application layer
- GIN indexes help maintain query performance

---

## ADR-002: State Management Strategy

**Date**: 2026-01-28

**Status**: Accepted

**Context**:
Modern React applications need efficient state management for different types of state (server data, UI state, authentication, etc.). Using a single solution for everything can lead to performance issues.

**Decision**:
Adopt a hybrid state management approach:
- **Redux Toolkit**: Authentication, user profile, permissions (global, infrequent changes)
- **React Query**: All server state (employees, projects, time-off, etc.)
- **Context API**: Theme, locale, environment settings
- **Local useState**: Component-specific UI state

**Alternatives Considered**:

1. **Redux for Everything**
   - Rejected: Boilerplate-heavy for server state, no built-in caching/synchronization

2. **Context API Only**
   - Rejected: Re-render performance issues, no devtools, manual cache management

3. **React Query Only**
   - Rejected: Not ideal for global app state like authentication

**Rationale**:
- Follows 2026 React best practices
- React Query handles server state caching, revalidation, and synchronization automatically
- Redux Toolkit for authentication provides persistence and middleware support
- Prevents unnecessary re-renders
- Each tool used for its strengths

**Consequences**:
- Developers need to understand when to use each tool
- Slightly more complex setup initially
- Better performance and maintainability long-term
- Excellent developer experience with DevTools

---

## ADR-003: Database Hierarchical Structure

**Date**: 2026-01-28

**Status**: Accepted

**Context**:
Employees need to report to other employees, creating an organizational hierarchy (manager -> team lead -> developer). We need efficient querying of hierarchies while preventing circular references.

**Decision**:
Use adjacency list model with self-referencing foreign key (`reports_to_id`) combined with PostgreSQL recursive CTEs for hierarchy queries.

**Alternatives Considered**:

1. **Materialized Path**
   - Example: `/1/5/12/` to represent path from root
   - Rejected: Complex to maintain when hierarchy changes, string manipulation overhead

2. **Nested Sets**
   - Uses left/right values to define tree structure
   - Rejected: Very complex updates when inserting nodes, not suitable for frequently changing hierarchies

3. **Closure Table**
   - Separate table storing all ancestor-descendant pairs
   - Rejected: Overkill for typical HR org depth (3-5 levels), extra storage overhead

**Rationale**:
- Simple to implement and understand
- PostgreSQL recursive CTEs handle hierarchy traversal efficiently
- Easy to prevent circular references with validation
- Flexible for organizational changes
- Common pattern in enterprise applications
- Typical org charts are shallow (3-5 levels), making this performant

**Consequences**:
- Recursive queries needed for full hierarchy (but PostgreSQL handles this well)
- Must implement circular reference prevention in application layer
- Simple data model is easy to maintain

---

## ADR-004: Authentication & Authorization

**Date**: 2026-01-28

**Status**: Accepted

**Context**:
The application requires:
1. Microsoft SSO for user login (specified requirement)
2. Stateless API authentication for REST endpoints
3. Fine-grained permissions for different resources

**Decision**:
- **Authentication**: Microsoft Azure AD OAuth2 for SSO
- **API Tokens**: JWT tokens issued after successful OAuth2 authentication
- **Authorization**: Role-Based Access Control (RBAC) with resource-action permissions

**Architecture**:
1. User authenticates via Microsoft Azure AD
2. Backend receives OAuth2 token, validates with Microsoft
3. Backend creates Employee record (if new user) or links existing
4. Backend generates JWT with user claims and permissions
5. Frontend stores JWT and uses for all API requests
6. Spring Security validates JWT on each request

**Alternatives Considered**:

1. **Session-Based Authentication**
   - Rejected: Not suitable for microservices, harder to scale, stateful

2. **OAuth2 Tokens for API**
   - Rejected: Additional latency validating with Microsoft on each request

3. **Attribute-Based Access Control (ABAC)**
   - Rejected: Overly complex for current requirements, RBAC sufficient

**Rationale**:
- Microsoft SSO meets client requirement
- JWT is industry standard for stateless REST APIs
- RBAC provides sufficient granularity for HR system
- Spring Security has excellent OAuth2 and JWT support
- Enables future microservices architecture

**Consequences**:
- Requires Azure AD setup and configuration
- JWT secret must be securely managed
- Token refresh strategy needed (implemented with refresh tokens)
- Permission changes require new JWT (or implement permission cache)

---

## ADR-005: Database Migration Tool

**Date**: 2026-01-28

**Status**: Accepted

**Context**:
Need version-controlled database schema changes with rollback support, team collaboration, and production deployment safety.

**Decision**:
Use Flyway for database migrations.

**Alternatives Considered**:

1. **Liquibase**
   - More features (XML/YAML format, changelog contexts)
   - Rejected: More complex than needed, prefer plain SQL, steeper learning curve

2. **Manual SQL Scripts**
   - Rejected: No version tracking, no rollback support, error-prone

3. **JPA/Hibernate DDL Auto**
   - Rejected: Not safe for production, no migration history, can lose data

**Rationale**:
- Industry standard for Spring Boot applications
- Version-controlled migrations in `src/main/resources/db/migration/`
- Plain SQL is simple and readable
- Automatic execution on application startup
- Migration history tracked in `flyway_schema_history` table
- Excellent error handling and validation
- Team collaboration through version control

**Consequences**:
- Migrations must follow naming convention: `V{version}__{description}.sql`
- Migrations are immutable once applied
- New changes require new migration files
- Must be careful with production migrations (test first)

---

## ADR-006: Frontend Build Tool

**Date**: 2026-01-28

**Status**: Accepted

**Context**:
Need fast development experience with hot module replacement, TypeScript support, and optimal production builds.

**Decision**:
Use Vite 7 as the build tool and development server.

**Alternatives Considered**:

1. **Create React App (CRA)**
   - Rejected: Deprecated, slow HMR, webpack-based, not maintained

2. **Next.js**
   - Rejected: Overkill for SPA, brings SSR complexity we don't need

3. **Webpack**
   - Rejected: Slower than Vite, more complex configuration

**Rationale**:
- Fastest development experience in 2026
- Native ESM-based HMR (instant updates)
- Excellent TypeScript support out of the box
- Optimized production builds with Rollup
- Simple configuration
- Growing ecosystem and community

**Consequences**:
- Team needs to learn Vite configuration (but simpler than webpack)
- Some older libraries may have ESM compatibility issues
- Overall better developer experience

---

## ADR-007: API Design Pattern

**Date**: 2026-01-28

**Status**: Accepted

**Context**:
Need consistent, RESTful API design that's easy to consume from frontend and document for future integrations.

**Decision**:
Follow REST principles with:
- Resource-based URLs (`/api/v1/employees`, `/api/v1/projects`)
- HTTP verbs for actions (GET, POST, PUT, DELETE)
- JSON request/response bodies
- Pagination with query parameters (`page`, `size`)
- Filtering with query parameters (`status=ACTIVE`)
- API versioning in URL (`/api/v1/`)

**Rationale**:
- Industry standard, widely understood
- Easy to consume from any HTTP client
- Clear separation between resources
- Version control allows breaking changes in future
- Spring Boot provides excellent REST support

**Consequences**:
- Must maintain API documentation
- Version 1 is the foundation, must be well-designed
- Breaking changes require new API version

---

## ADR-008: Monorepo vs Separate Repos

**Date**: 2026-01-28

**Status**: Accepted (Monorepo)

**Context**:
Backend and frontend are tightly coupled as one product. Need to decide repository structure.

**Decision**:
Use a monorepo with both backend and frontend in the same repository.

**Structure**:
```
bonarda-hr-system/
├── backend/
├── frontend/
├── docs/
└── docker/
```

**Alternatives Considered**:

1. **Separate Repositories**
   - Rejected: More overhead, harder to coordinate changes, version mismatch issues

**Rationale**:
- Single source of truth
- Coordinated versioning
- Easier to make breaking changes across stack
- Simpler CI/CD pipelines
- Better for small to medium teams
- Documentation stays in sync

**Consequences**:
- Larger repository size
- Need clear directory structure
- Separate build/deployment processes for each part
- Overall simpler for this project size

---

## ADR-009: Employee Source of Truth - Microsoft Azure AD

**Date**: 2026-02-01

**Status**: Accepted

**Context**:
Employees already exist in the organization's Microsoft Azure AD (Entra ID). Manually creating employees in the HR system would duplicate effort and risk data inconsistency.

**Decision**:
Microsoft Azure AD is the source of truth for employee identity. Core employee data (name, email, job title, department, manager, phone) is synced from Microsoft Graph API. Our system enriches profiles with HR-specific data (configurable sections, project assignments, time-off, etc.).

**Employee Lifecycle**:
1. Employee exists in Azure AD
2. On first SSO login, a local employee record is created/linked
3. Core identity fields remain read-only (synced from Microsoft)
4. HR-managed fields (position overrides, configurable sections, reports_to) are editable locally

**Dev Mode**:
Since Azure credentials aren't always available, a dev profile seeds test employees directly. A `DevDataSeeder` runs on startup when `spring.profiles.active=dev`.

**Consequences**:
- No manual employee creation form for core identity data
- Employee enrichment/edit form only shows locally-managed fields
- Requires Microsoft Graph API permissions: `User.Read.All`, `Directory.Read.All`
- Eventual consistency between Azure AD and local database
- Dev mode provides full CRUD for testing without Azure

---

## ADR-010: Document Storage - SharePoint Integration

**Date**: 2026-02-01

**Status**: Accepted

**Context**:
The organization already uses SharePoint for document management with established access control policies. Building a separate document storage system would bypass existing governance.

**Decision**:
Documents are stored in and served from SharePoint. Our system references SharePoint document IDs rather than storing files locally. All document access flows through Microsoft Graph API using the user's delegated token (on-behalf-of flow), so SharePoint enforces its own permissions.

**Architecture**:
1. User requests a document through our UI
2. Backend calls SharePoint using the user's delegated access token
3. SharePoint evaluates its own access control rules
4. Document is returned or access denied

**Consequences**:
- No local document storage needed
- SharePoint access control is respected automatically
- No permission duplication in our database
- Requires Azure app registration with `Sites.Read.All` and `Files.ReadWrite.All` delegated permissions
- Document signing workflow stores signature metadata locally but references SharePoint document IDs
- Offline access not supported (depends on SharePoint availability)

---

## ADR-011: Authentication & RBAC with JWT and Dev Mode

**Date**: 2026-02-01

**Status**: Accepted

**Context**:
The system needs authentication and role-based access control. In production, Microsoft Azure AD OAuth2 will be used. During development, Azure credentials are unavailable, so a dev-mode login mechanism is needed.

**Decision**:
- Spring Security with stateless JWT sessions
- `@PreAuthorize` method-level security using permission strings (e.g., `EMPLOYEE_CREATE`, `EMPLOYEE_READ_ALL`)
- Four default roles seeded by Flyway: ADMIN, HR_MANAGER, MANAGER, EMPLOYEE
- Dev profile provides a `POST /api/v1/auth/dev-login` endpoint that accepts an employee ID and returns a JWT
- `DevAuthController` and `DevDataSeeder` are `@Profile("dev")` only
- `AuthController` provides `/api/v1/auth/me` for the current user
- Frontend uses React Context for auth state (`AuthProvider`, `useAuth` hook)
- `ProtectedRoute` component redirects to `/login` if unauthenticated
- JWT token stored in `localStorage`, attached via Axios request interceptor

**Alternatives Considered**:
1. **Session-based auth**: Rejected because the API is stateless and will serve mobile clients
2. **Redux for auth state**: Overkill for auth-only state; React Context is sufficient
3. **Single controller for all auth**: Split into `AuthController` (always active) and `DevAuthController` (`@Profile("dev")`) for cleaner separation

**Consequences**:
- Production deployment will add OAuth2 flow alongside the existing JWT infrastructure
- The dev-login endpoint is completely absent in production builds
- Permissions are granular (per-resource per-action), making it easy to add new resources later

---

## ADR-012: Dual-Identifier Pattern (UUID Public IDs)

**Date**: 2026-02-01

**Status**: Accepted

**Context**:
REST APIs that expose auto-incrementing database IDs (`/employees/5`) leak information about record count and creation order. Sequential IDs are also guessable, increasing the risk of insecure direct object references (IDOR). We needed a way to expose opaque identifiers in the API without sacrificing internal query performance.

**Decision**:
Every entity keeps its internal `BIGSERIAL id` for foreign keys, joins, and JPA relationships. A new `public_id UUID` column is the only identifier exposed through the REST API and URLs.

**Mapping Boundary**:
- **Controllers** accept and return UUIDs (as `String` in DTOs)
- **Services** resolve UUIDs to entities via `findByPublicId()`, then use internal IDs for all downstream queries
- **Repositories** use `Long id` for joins and foreign keys
- **JWT** continues to carry the internal `Long id` as subject (opaque to the client)

**Database**:
- Migration `V3__add_employee_public_id.sql` adds `public_id UUID NOT NULL DEFAULT gen_random_uuid()` with a unique index
- Existing rows auto-populated via the DEFAULT
- `@PrePersist` generates UUID for JPA-created entities

**Alternatives Considered**:

1. **UUID as Primary Key**
   - Rejected: 16-byte PK increases index size, foreign key joins slower than 8-byte BIGINT, B-tree fragmentation from random UUIDs

2. **Hashids / Short IDs**
   - Rejected: Requires encoding/decoding layer, collisions possible at scale, not truly random

3. **Expose BIGSERIAL directly**
   - Rejected: Enumerable, leaks record count, IDOR risk

**Consequences**:
- Every entity needs a `publicId` UUID field and a `findByPublicId()` repository method
- DTOs use `String` for IDs (UUID serialized as string)
- Malformed UUID strings in API requests return 400 via `IllegalArgumentException` handler
- Slight overhead from UUID lookup, mitigated by unique index

---

## ADR-013: Time Off Management — Workflow and Balance Tracking

**Date**: 2026-02-01

**Status**: Accepted

**Context**:
Employees need to request time off, managers need to approve or reject requests, and the system needs to track remaining leave balances per employee, per leave type, per year. Half-day requests and overlapping request detection are required.

**Decision**:
Three-table design with a denormalized `pending` counter for responsive balance reads:

- **`time_off_types`**: Configurable leave categories (Annual Leave, Sick Leave, etc.) with `default_days_per_year`, carry-over settings, and soft-delete via `is_active`
- **`time_off_balances`**: Per-employee, per-type, per-year allocation with `total_allocated`, `used`, `pending`, and `carry_over` columns (all `NUMERIC(5,1)` for half-day precision)
- **`time_off_requests`**: Individual leave requests with `status` (PENDING → APPROVED/REJECTED/CANCELLED) workflow

**Request Lifecycle**:
1. Employee submits request → business days calculated (weekdays only, half-day = 0.5) → balance checked → `pending` incremented → status = PENDING
2. Manager approves → `pending` decremented, `used` incremented → status = APPROVED
3. Manager rejects → `pending` decremented → status = REJECTED
4. Employee cancels → `pending` decremented → status = CANCELLED

**Overlap Detection**: Queries for existing PENDING or APPROVED requests in the date range. Half-day requests on the same day are allowed if they cover different periods (MORNING + AFTERNOON).

**Concurrency**: The `review()` method uses `@Lock(PESSIMISTIC_WRITE)` to prevent double-approval race conditions.

**Alternatives Considered**:

1. **Compute balances from requests on every read**
   - Rejected: Expensive aggregation query on every balance check; denormalized `pending`/`used` counters are O(1) reads

2. **Calendar-day counting (including weekends)**
   - Rejected: Would waste leave days on non-working days; business-day counting (weekdays only) is standard for leave systems

3. **Optimistic locking for reviews**
   - Rejected: Concurrent approvals would silently fail; pessimistic lock guarantees exactly-once state transitions

**Consequences**:
- `pending` counter must be kept in sync across create, review, and cancel operations
- Business day calculation excludes weekends but does not account for public holidays (future enhancement)
- Half-day requests are restricted to a single day (`CHECK(half_day=false OR start_date=end_date)`)

---

## ADR-014: Section-Level Visibility Permissions

**Date**: 2026-02-01

**Status**: Accepted

**Context**:
Employee profiles contain configurable sections, some of which hold sensitive data (payroll, emergency contacts, documents). Not all sections should be visible to every user. Managers and HR need to see payroll data, but a regular employee viewing a colleague's profile should not.

**Decision**:
Add a `required_permission` column to `employee_sections`. Each sensitive section references a permission string (e.g., `SECTION_PAYROLL_VIEW`). The visibility logic is:

1. **No `required_permission` set** → section is visible to everyone
2. **Viewer is the profile owner** → always visible (you can see your own data)
3. **`required_permission` is set** → visible only if the viewer holds that permission

**Implementation**:
- Migration `V2__add_section_visibility.sql` adds the column and seeds three permissions
- `EmployeeSectionService.getVisibleSections()` filters sections based on the rules above
- `EmployeeController` guards individual section data endpoints with the same check (returns 403 if denied)
- A new `GET /api/v1/sections/visible?employeeId=X` endpoint returns only the sections the caller can see

**Alternatives Considered**:

1. **Hardcode visibility rules in the frontend**
   - Rejected: Client-side filtering is bypassable; the API must enforce access control

2. **Role-based section mapping table**
   - Rejected: More complex schema for minimal benefit; permission-based approach reuses existing RBAC infrastructure

**Consequences**:
- Adding a new sensitive section only requires setting its `required_permission` and assigning that permission to appropriate roles
- Frontend calls `/sections/visible` to know which tabs to render, keeping UI in sync with backend enforcement
- Self-view always shows all sections regardless of permissions

---

## ADR-015: Error Handling Strategy

**Date**: 2026-02-01

**Status**: Accepted

**Context**:
The application needs consistent error handling across both backend and frontend to provide good developer experience and user-facing error messages without leaking internal details.

**Decision**:

**Backend** — `GlobalExceptionHandler` (`@RestControllerAdvice`) catches and maps exceptions to HTTP responses:
- `ResourceNotFoundException` → 404 (message includes resource type only, never field names or values)
- `BadRequestException` → 400 (business rule violations with user-readable messages)
- `IllegalArgumentException` → 400 (malformed UUIDs, invalid enum values)
- `MethodArgumentNotValidException` → 400 (Bean Validation failures with per-field errors)
- `Exception` (catch-all) → 500 with generic message; actual exception logged via SLF4J

All error responses use a consistent `ErrorResponse` structure: `{ status, message, timestamp, details }`.

**Frontend** — Two layers:
- **React Error Boundary** wraps the main content area in `MainLayout`. Catches render-time exceptions and shows a recovery UI with a "Try again" button, preventing full-page crashes.
- **API error extraction** via `getApiErrorMessage()` utility: safely extracts the `message` field from Axios error responses using `axios.isAxiosError()` type guard, with a generic fallback.

**Alternatives Considered**:

1. **Let exceptions propagate to Spring Boot's default error handler**
   - Rejected: Default handler returns inconsistent format, exposes stack traces in dev, and doesn't log in production

2. **Frontend global `window.onerror` handler**
   - Rejected: Cannot render recovery UI; React Error Boundaries are the React-idiomatic approach

**Consequences**:
- Error messages never leak internal identifiers, SQL details, or stack traces to the client
- Unhandled exceptions are always logged server-side for debugging
- Frontend rendering errors are contained to the content area; sidebar and navigation remain functional

---

## ADR-015: Mock SharePoint Service for Local Development

**Date**: 2026-02-03

**Status**: Accepted

**Context**:
The SharePoint integration requires Microsoft Graph API credentials (tenant ID, client ID, client secret) which are not available in local development. Without credentials, the entire document management UI — file browsing, uploads, previews — is unusable during development.

**Decision**:
Use Spring's `@ConditionalOnProperty` to switch between real and mock implementations:

- **`microsoft.graph.mock-enabled=true`** (default) → `SharePointServiceMockImpl` activates, returns realistic fake data
- **`microsoft.graph.mock-enabled=false`** → `SharePointServiceImpl` activates, uses real Microsoft Graph API

The mock provides: 2 SharePoint sites (HR Portal, Company Intranet), document drives with folders and files (PDFs, DOCX, XLSX), in-memory file upload tracking, and configured Quick Access libraries.

**Configuration**:
```yaml
# Default (mock active, no credentials needed):
microsoft.graph.mock-enabled: true   # or just omit — defaults to true

# Production (real Graph API):
microsoft.graph.mock-enabled: false
MS_TENANT_ID: your-tenant-id
MS_CLIENT_ID: your-client-id
MS_CLIENT_SECRET: your-client-secret
```

**Alternatives Considered**:
1. **WireMock/TestContainers** — overkill for dev-time UI testing
2. **Feature flags on the frontend** — wouldn't test backend integration
3. **Always require real credentials** — blocks development without Azure setup

---

## ADR-016: Testing Microsoft Integrations (SSO + SharePoint)

**Date**: 2026-02-03

**Status**: Accepted

**Context**:
The app uses Microsoft for two separate integrations: Azure AD (Entra ID) for SSO login, and Microsoft Graph API for SharePoint document management. Both need credentials from an Azure tenant. The M365 Developer Program sandbox is not available to all developers (eligibility restrictions), so we need alternatives.

### Option A: Free Azure Account (Recommended for SSO)

A regular **free Azure account** includes Azure AD (Entra ID) at no cost — no M365 Developer Program needed. This is sufficient to test SSO login.

1. **Create a free Azure account**: https://azure.microsoft.com/free/ (requires a Microsoft account)
2. **Your tenant is created automatically** — find the Tenant ID in Azure Portal → Azure Active Directory → Overview
3. **Create test users** in Azure AD → Users → New user (e.g., `testuser@yourdomain.onmicrosoft.com`)

#### SSO App Registration

4. **Register an app** in Azure Portal → App registrations → New registration
   - Name: "BonardaHR - SSO"
   - Redirect URI: `http://localhost:8081/login/oauth2/code/azure` (Web platform)
5. **Add API permissions**: Microsoft Graph → Delegated permissions:
   - `openid`, `profile`, `email`, `User.Read`
6. **Create a client secret**: Certificates & secrets → New client secret
7. **Configure environment variables**:
   ```bash
   export AZURE_AD_CLIENT_ID=your-client-id
   export AZURE_AD_CLIENT_SECRET=your-secret
   export AZURE_AD_TENANT_ID=your-tenant-id
   ```
8. **Test**: Navigate to the login page → click "Sign in with Microsoft" → authenticate with a test user

#### SharePoint App Registration (if you have SharePoint access)

If your Azure tenant has SharePoint Online (requires M365 license), you can also test real SharePoint:

9. **Register a second app** (or reuse the same one with additional permissions)
   - Add Application permissions: `Sites.ReadWrite.All`, `Files.ReadWrite.All`
   - Grant admin consent
10. **Configure environment variables**:
    ```bash
    export MS_TENANT_ID=your-tenant-id
    export MS_CLIENT_ID=your-client-id
    export MS_CLIENT_SECRET=your-secret-value
    export SP_MOCK_ENABLED=false
    ```
11. **Optional — configure library shortcuts** via Graph Explorer (https://developer.microsoft.com/en-us/graph/graph-explorer):
    ```bash
    export SP_POLICIES_SITE_ID=your-site-id
    export SP_POLICIES_DRIVE_ID=your-drive-id
    ```

### Option B: M365 Developer Program (if eligible)

If you qualify, the M365 Developer Program (https://developer.microsoft.com/en-us/microsoft-365/dev-program) provides a free E5 sandbox with SharePoint, Azure AD, and 25 test users. Not all developers are eligible.

### Option C: No Azure Account (Default)

Without any Azure setup, the app works in full local dev mode:
- **SharePoint**: Mock service returns realistic fake data (sites, drives, files, folders)
- **SSO**: Dev login page lets you authenticate as any seeded employee
- **No code changes needed** — this is the default configuration

### Dev Workflow Summary

| Scenario | Config | What Works |
|----------|--------|-----------|
| **Quick local dev** | Default (no env vars) | Mock SharePoint data, dev login (no SSO) |
| **SSO testing only** | Set `AZURE_AD_*` env vars (free Azure account) | Real Microsoft login + mock SharePoint |
| **Full integration** | Set `AZURE_AD_*` + `MS_*` + `SP_MOCK_ENABLED=false` | Real SSO + real SharePoint |

**Consequences**:
- Developers can work on all features immediately without any Azure setup
- SSO testing only requires a free Azure account (no M365 license needed)
- SharePoint testing uses the mock by default; real Graph API is opt-in
- Same codebase works across all environments via environment variables

---

## ADR-017: Backend Entity Resolution Pattern

**Date**: 2026-02-06

**Status**: Accepted

**Context**:
Multiple services needed to resolve entities by their public UUID, leading to duplicated code patterns like:
```java
Employee employee = employeeRepository.findByPublicId(publicId)
    .orElseThrow(() -> new ResourceNotFoundException("Employee", publicId));
```

This pattern was repeated across EmployeeService, TimeOffRequestService, DocumentService, ProjectService, and others.

**Decision**:
Create a centralized `EntityResolutionService` that provides type-safe, consistent entity resolution with standardized error messages.

**Implementation**:
```java
@Service
@RequiredArgsConstructor
public class EntityResolutionService {
    private final EmployeeRepository employeeRepository;
    private final TimeOffTypeRepository timeOffTypeRepository;
    // ... other repositories

    public Employee resolveEmployee(UUID publicId) {
        return employeeRepository.findByPublicId(publicId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee", publicId));
    }

    public TimeOffType resolveTimeOffType(UUID publicId) {
        return timeOffTypeRepository.findByPublicId(publicId)
            .orElseThrow(() -> new ResourceNotFoundException("TimeOffType", publicId));
    }
    // ... other resolve methods
}
```

**Alternatives Considered**:

1. **Keep resolution inline in each service**
   - Rejected: Code duplication, inconsistent error messages, harder to maintain

2. **Generic resolution method with Class parameter**
   - Rejected: Loses type safety, requires casting, more complex usage

3. **Repository default methods**
   - Rejected: Ties exception handling to repository layer, violates separation of concerns

**Consequences**:
- Single point of change for error message format
- Consistent `ResourceNotFoundException` behavior across all services
- Services inject `EntityResolutionService` instead of multiple repositories when only resolution is needed
- Easy to add logging, metrics, or caching in one place

---

## ADR-018: Backend Enum Parsing Utility

**Date**: 2026-02-06

**Status**: Accepted

**Context**:
Parsing string values from DTOs to enums was scattered across services with inconsistent error handling:
```java
EventType eventType;
try {
    eventType = EventType.valueOf(request.getEventType());
} catch (IllegalArgumentException e) {
    throw new BadRequestException("Invalid event type: " + request.getEventType());
}
```

**Decision**:
Create a centralized `EnumParser` utility class with a generic parsing method that provides consistent error messages and validation.

**Implementation**:
```java
public final class EnumParser {
    private EnumParser() {} // Utility class

    public static <E extends Enum<E>> E parse(Class<E> enumClass, String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(fieldName + " is required");
        }
        try {
            return Enum.valueOf(enumClass, value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            String validValues = Arrays.stream(enumClass.getEnumConstants())
                .map(Enum::name)
                .collect(Collectors.joining(", "));
            throw new BadRequestException("Invalid " + fieldName + ": '" + value +
                "'. Valid values: " + validValues);
        }
    }
}
```

**Usage**:
```java
EventType eventType = EnumParser.parse(EventType.class, request.getEventType(), "eventType");
```

**Consequences**:
- Consistent, user-friendly error messages that list valid values
- Handles null/blank input gracefully
- Case-insensitive parsing (uppercase conversion)
- Single import for all enum parsing needs

---

## ADR-019: Backend Application Constants

**Date**: 2026-02-06

**Status**: Accepted

**Context**:
Magic numbers and strings were scattered throughout the codebase:
- Default page sizes: `10`, `20`, `50`
- Validation limits: `255`, `500`, `2000`
- Date formats: `"yyyy-MM-dd"`, `"HH:mm"`
- Error message templates

**Decision**:
Create an `AppConstants` class to centralize application-wide constants, organized by category.

**Implementation**:
```java
public final class AppConstants {
    private AppConstants() {}

    // Pagination
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;

    // Validation Limits
    public static final int MAX_TITLE_LENGTH = 200;
    public static final int MAX_DESCRIPTION_LENGTH = 2000;
    public static final int MAX_EMAIL_LENGTH = 255;

    // Date/Time Formats
    public static final String DATE_FORMAT = "yyyy-MM-dd";
    public static final String TIME_FORMAT = "HH:mm";
    public static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern(DATE_FORMAT);

    // Business Rules
    public static final int MAX_HOURS_PER_DAY = 24;
    public static final BigDecimal HALF_DAY_HOURS = new BigDecimal("0.5");
}
```

**Consequences**:
- Single source of truth for magic values
- Easy to change limits across the application
- IDE autocomplete for constant discovery
- Compile-time safety (vs. configuration files)

---

## ADR-020: Frontend Modal Component Composition

**Date**: 2026-02-06

**Status**: Accepted

**Context**:
The application has 20+ modal dialogs across features (events, projects, documents, time-off, admin). Each modal implemented its own overlay, container, close handling, and layout, leading to:
- ~50 lines of boilerplate per modal
- Inconsistent styling (different padding, shadow, rounded corners)
- Duplicated accessibility concerns (focus trap, click-outside handling)
- Maintenance burden when making global styling changes

**Decision**:
Create a composable Modal component system with four parts:
- `Modal` — overlay, container, size variants, close handling
- `ModalBody` — content area with consistent padding
- `ModalFooter` — action buttons area with proper alignment
- `ModalError` — error message display with red styling

**Implementation**:
```tsx
// shared/components/ui/Modal.tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, size = 'lg', children }: ModalProps) {
  if (!open) return null;
  const sizeClass = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }[size];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClass} mx-4`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ModalBody({ children }: { children: React.ReactNode }) {
  return <div className="p-4 space-y-4">{children}</div>;
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-3 p-4 border-t">{children}</div>;
}

export function ModalError({ message }: { message: string }) {
  return <p className="text-sm text-red-600">{message}</p>;
}
```

**Usage**:
```tsx
<Modal open={isOpen} onClose={handleClose} title="Create Event">
  <form onSubmit={handleSubmit}>
    <ModalBody>
      <FormInput label="Title" {...register('title')} error={errors.title?.message} />
      {mutation.isError && <ModalError message={getApiErrorMessage(mutation.error)} />}
    </ModalBody>
    <ModalFooter>
      <Button variant="secondary" onClick={handleClose}>Cancel</Button>
      <Button type="submit" disabled={mutation.isPending}>Save</Button>
    </ModalFooter>
  </form>
</Modal>
```

**Alternatives Considered**:

1. **Third-party modal library (Radix, Headless UI)**
   - Rejected: Additional dependency, our styling needs are straightforward

2. **Single modal component with all props**
   - Rejected: Prop explosion, inflexible for complex content layouts

3. **Keep inline modal markup**
   - Rejected: Inconsistency, code duplication, maintenance burden

**Consequences**:
- Modal boilerplate reduced from ~50 lines to ~5 lines
- Consistent styling across all 20+ modals
- Single place to update modal appearance (e.g., shadow, border radius)
- Flexible composition for complex modal layouts
- Easy to add global features (animations, focus trap) in one place

---

## ADR-021: Frontend Form Field Components

**Date**: 2026-02-06

**Status**: Accepted

**Context**:
Form fields in modals and pages had inconsistent implementations:
- Different label styling (font size, color, weight)
- Inconsistent error message placement and styling
- Repeated Tailwind classes for inputs
- Different patterns for required field indicators

**Decision**:
Create a set of standardized form field components that encapsulate label, input, and error display:

**Implementation**:
```tsx
// shared/components/ui/FormFields.tsx
interface BaseFieldProps {
  label: string;
  error?: string;
  required?: boolean;
}

export function FormInput({ label, error, required, ...props }: BaseFieldProps & InputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-300' : 'border-gray-300'}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function FormSelect({ label, error, required, options, ...props }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select className={`w-full px-3 py-2 border rounded-lg ...`} {...props}>
        <option value="">Select...</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function FormTextarea({ label, error, required, ...props }: TextareaFieldProps) { ... }

export function FormCheckbox({ label, description, ...props }: CheckboxFieldProps) { ... }
```

**Usage with React Hook Form**:
```tsx
<FormInput
  label="Event Title"
  required
  error={errors.title?.message}
  {...register('title')}
/>

<FormSelect
  label="Event Type"
  options={EVENT_TYPE_OPTIONS}
  error={errors.eventType?.message}
  {...register('eventType')}
/>
```

**Consequences**:
- Consistent form styling across all features
- Built-in error display with proper styling
- Required field indicators standardized
- Reduced form code by ~60%
- Easy to add global form features (tooltips, character counts)

---

## ADR-022: Frontend Centralized Constants

**Date**: 2026-02-06

**Status**: Accepted

**Context**:
Dropdown options, status labels, and other constants were defined inline in each component:
```tsx
// In CreateEventModal.tsx
const eventTypes = [
  { value: 'MEETING', label: 'Meeting' },
  { value: 'CELEBRATION', label: 'Celebration' },
  // ...
];

// Duplicated in EditEventModal.tsx
const eventTypes = [
  { value: 'MEETING', label: 'Meeting' },
  // ...
];
```

This led to:
- Duplicated code across create/edit modals
- Risk of inconsistency (e.g., different labels in different places)
- Difficulty finding where options are defined

**Decision**:
Centralize dropdown options as exported constants in feature-level `constants.ts` files.

**Implementation**:
```tsx
// features/dashboard/constants.ts
export const EVENT_TYPE_OPTIONS = [
  { value: 'MEETING', label: 'Meeting' },
  { value: 'CELEBRATION', label: 'Celebration' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'COMPANY_WIDE', label: 'Company Wide' },
  { value: 'SOCIAL', label: 'Social' },
  { value: 'OTHER', label: 'Other' },
] as const;

// features/projects/constants.ts
export const PROJECT_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const;

export const ROLE_OPTIONS = [
  { value: 'LEAD', label: 'Lead' },
  { value: 'MEMBER', label: 'Member' },
] as const;
```

**Pattern for Styling Constants**:
```tsx
// For badge/chip styling based on status
export const EVENT_TYPE_STYLES: Record<EventType, { bg: string; text: string; label: string }> = {
  MEETING: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Meeting' },
  // ...
};

export function getEventTypeStyle(eventType: EventType) {
  return EVENT_TYPE_STYLES[eventType] || EVENT_TYPE_STYLES.OTHER;
}
```

**Consequences**:
- Single source of truth for dropdown options
- TypeScript `as const` provides type safety
- Easy to add new options or change labels
- Styling functions colocated with data
- Import paths are predictable: `from '../constants'`

---

## ADR-023: Calendar Sync — Best-Effort Pattern

**Date**: 2026-02-03

**Status**: Accepted

**Context**:
When a manager approves a time-off request, an event should be created on the employee's Outlook calendar. Calendar sync involves an external API (Microsoft Graph) that can fail for various reasons (network issues, permissions, user not in Azure AD). The approval workflow must not be blocked by calendar failures.

**Decision**:
Calendar synchronization is best-effort: failures are logged but never thrown. The `CalendarService` interface and its implementations (`CalendarServiceImpl` for real Graph API, `CalendarServiceMockImpl` for dev mode) follow these rules:

1. **createEvent()** returns the event ID on success, `null` on any failure (including missing `microsoftUserId`)
2. **deleteEvent()** silently logs failures but never throws
3. All exceptions are caught and logged at WARN level
4. The `calendarEventId` is stored on the request to enable deletion on cancellation

**Implementation**:
```java
// In TimeOffRequestServiceImpl.review()
if (decision == TimeOffRequestStatus.APPROVED) {
    String eventId = calendarService.createEvent(request);  // Never throws
    if (eventId != null) {
        request.setCalendarEventId(eventId);
        requestRepository.save(request);
    }
    // Approval proceeds even if eventId is null
}
```

**Consequences**:
- Approval workflow is never blocked by calendar issues
- Calendar sync status is visible in UI (`calendarSynced` field)
- Employees without `microsoftUserId` are gracefully skipped
- Ops team can monitor logs for sync failures without user impact
- Retry logic can be added later without changing the service contract

---

## ADR-024: Company-Wide Documents

**Date**: 2026-02-05

**Status**: Accepted

**Context**:
Some documents (policies, employee handbooks, benefits guides) need to be visible to all employees without requiring individual shares. The existing share model requires explicit `document_shares` rows for each employee.

**Decision**:
Add a `company_wide` boolean column to `documents`. Company-wide documents:
- Are visible to all authenticated employees (no share check)
- Cannot require signatures (enforced via validation)
- Cannot be shared individually (sharing endpoint returns 400)
- Are displayed in a dedicated "Company Documents" tab

**Implementation**:
```java
// In DocumentServiceImpl.verifyDocumentAccess()
if (document.getCompanyWide()) {
    return; // Access granted for any authenticated user
}
// ... existing share-based access check
```

**Consequences**:
- No need to create share rows for every employee
- Company documents are immediately visible to new employees
- Clear separation between company-wide and individually shared documents
- Signature workflow is explicitly excluded for company documents

---

## Future ADRs

As the project evolves, we'll document additional decisions here for:
- Caching strategy
- Public holiday calendar integration (for business day calculation)
- Background job processing
- Email notification service
- Real-time features (WebSockets)
- Mobile application approach
- Monitoring and observability tools
