# Architectural Decision Records (ADR)

This document tracks all significant architectural decisions made during the development of the Nonnie HR System.

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
nonnie-hr-system/
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

## Future ADRs

As the project evolves, we'll document additional decisions here for:
- Caching strategy
- Background job processing
- File storage solution for documents
- Email notification service
- Real-time features (WebSockets)
- Mobile application approach
- Monitoring and observability tools
