# Database Schema Documentation

## Overview

BonardaHR uses PostgreSQL 15+ as the database with Flyway for version-controlled migrations.

## Core Design Principles

1. **Hybrid Data Model**: Fixed columns for core fields + JSONB for configurable sections
2. **Audit Trail**: All main tables include created_at, updated_at, created_by, updated_by
3. **Soft Deletes**: Where appropriate, use status flags instead of hard deletes
4. **Referential Integrity**: Foreign keys with appropriate CASCADE/SET NULL actions
5. **Performance**: Indexes on foreign keys, search fields, and JSONB queries (GIN)

## Entity Relationship Overview

```
employees (1) ──── (N) employee_field_values
    │                       │
    │ (self-ref)            │
    │                  section_fields
    └─ reports_to           │
                       employee_sections
    │
    ├── (N) ──── (N) roles (via employee_roles)
    │                  │
    │            roles (N) ──── (N) permissions (via role_permissions)
    │
    ├── (1) ──── (N) time_off_balances ──── (N) time_off_types
    │
    ├── (1) ──── (N) time_off_requests ──── (N) time_off_types
    │                       │
    │                  reviewer_id ──── employees
    │
```

## Table Descriptions

### employees

Core employee information with fixed schema fields.

**Columns**:
- `id` (BIGSERIAL, PK): Internal identifier (used for FKs, joins, JWT subject)
- `public_id` (UUID, NOT NULL, UNIQUE): API-facing identifier (added in V3)
- `first_name` (VARCHAR(100), NOT NULL): Employee first name
- `last_name` (VARCHAR(100), NOT NULL): Employee last name
- `email` (VARCHAR(255), UNIQUE, NOT NULL): Company email address
- `phone_number` (VARCHAR(20), NULL): Contact phone number
- `position` (VARCHAR(100), NULL): Job title/position
- `location` (VARCHAR(100), NULL): Work location (office, city, remote)
- `birthday` (DATE, NULL): Date of birth
- `hire_date` (DATE, NOT NULL): Date employee was hired
- `status` (VARCHAR(20), NOT NULL): Employment status (ACTIVE, INACTIVE, ON_LEAVE, TERMINATED)
- `reports_to_id` (BIGINT, NULL, FK): ID of manager/supervisor
- `microsoft_user_id` (VARCHAR(255), UNIQUE, NULL): Azure AD user ID for SSO
- Audit fields: `version`, `created_at`, `updated_at`, `created_by`, `updated_by`

> The `public_id` UUID is the only identifier exposed through the REST API. Internal `id` is never returned to clients. See ADR-012 for rationale.

**Indexes**:
- `idx_employees_public_id` on `public_id` (unique)
- `idx_employees_reports_to` on `reports_to_id`
- `idx_employees_email` on `email`
- `idx_employees_status` on `status`
- `idx_employees_hire_date` on `hire_date`
- `idx_employees_microsoft_user_id` on `microsoft_user_id`

**Constraints**:
- `fk_employees_reports_to`: Self-referencing FK to `employees(id)` ON DELETE SET NULL
- `chk_employee_status`: Status must be one of (ACTIVE, INACTIVE, ON_LEAVE, TERMINATED)

**Computed Fields** (Application-level):
- `tenure`: Calculated as Period between hire_date and current date
- `fullName`: Concatenation of first_name + last_name

---

### employee_sections

Defines configurable section categories that can be added to employee profiles.

**Columns**:
- `id` (BIGSERIAL, PK): Section identifier
- `name` (VARCHAR(100), UNIQUE, NOT NULL): Internal name (e.g., "payroll", "hobbies")
- `display_name` (VARCHAR(100), NOT NULL): User-facing name (e.g., "Payroll Information")
- `description` (TEXT, NULL): Description of what this section contains
- `display_order` (INTEGER, NOT NULL, DEFAULT 0): Order to display sections in UI
- `is_active` (BOOLEAN, NOT NULL, DEFAULT true): Whether section is currently active
- `required_permission` (VARCHAR(100), NULL): Permission needed to view this section on another employee's profile (added in V2). NULL = visible to all. See ADR-014.
- `created_at`, `updated_at`: Audit timestamps

**Indexes**:
- `idx_employee_sections_name` on `name`
- `idx_employee_sections_is_active` on `is_active`

**Default Data**:
| Section | Display Name | Required Permission |
|---------|-------------|-------------------|
| payroll | Payroll Information | `SECTION_PAYROLL_VIEW` |
| personal | Personal Interests | _(none — visible to all)_ |
| emergency | Emergency Contact | `SECTION_EMERGENCY_VIEW` |
| documents | Documents | `SECTION_DOCUMENTS_VIEW` |

---

### section_fields

Defines individual fields within each section, creating a schema for dynamic fields.

**Columns**:
- `id` (BIGSERIAL, PK): Field identifier
- `section_id` (BIGINT, NOT NULL, FK): Parent section
- `field_name` (VARCHAR(100), NOT NULL): Internal field name (e.g., "emergency_contact_name")
- `field_label` (VARCHAR(100), NOT NULL): User-facing label (e.g., "Emergency Contact Name")
- `field_type` (VARCHAR(50), NOT NULL): Data type (TEXT, NUMBER, DATE, BOOLEAN, SELECT, MULTI_SELECT)
- `field_options` (JSONB, NULL): For SELECT types, stores available options
- `is_required` (BOOLEAN, NOT NULL, DEFAULT false): Whether field is mandatory
- `display_order` (INTEGER, NOT NULL, DEFAULT 0): Order within section
- `validation_rules` (JSONB, NULL): Custom validation rules (min, max, pattern, etc.)
- `created_at`, `updated_at`: Audit timestamps

**Indexes**:
- `idx_section_fields_section` on `section_id`
- `idx_section_fields_options` GIN index on `field_options` JSONB

**Constraints**:
- `fk_section_fields_section`: FK to `employee_sections(id)` ON DELETE CASCADE
- `uq_section_field_name`: UNIQUE(section_id, field_name)
- `chk_field_type`: field_type IN (TEXT, NUMBER, DATE, BOOLEAN, SELECT, MULTI_SELECT)

**Example field_options JSONB**:
```json
{
  "options": ["Option 1", "Option 2", "Option 3"]
}
```

**Example validation_rules JSONB**:
```json
{
  "min": 0,
  "max": 100,
  "pattern": "^[A-Z][a-z]+$"
}
```

---

### employee_field_values

Stores actual values for configurable fields per employee.

**Columns**:
- `id` (BIGSERIAL, PK): Value identifier
- `employee_id` (BIGINT, NOT NULL, FK): Employee who owns this value
- `section_field_id` (BIGINT, NOT NULL, FK): Field definition this value is for
- `value` (JSONB, NOT NULL): The actual value stored as JSON
- `created_at`, `updated_at`: Audit timestamps

**Indexes**:
- `idx_employee_field_values_employee` on `employee_id`
- `idx_employee_field_values_field` on `section_field_id`
- `idx_employee_field_values_value` GIN index on `value` JSONB

**Constraints**:
- `fk_employee_field_values_employee`: FK to `employees(id)` ON DELETE CASCADE
- `fk_employee_field_values_field`: FK to `section_fields(id)` ON DELETE CASCADE
- `uq_employee_field`: UNIQUE(employee_id, section_field_id)

**Value Storage Format**:

The value JSONB stores different formats based on field type:

```json
// TEXT
{"stringValue": "John Doe"}

// NUMBER
{"numberValue": 75000}

// DATE
{"dateValue": "2024-01-15"}

// BOOLEAN
{"booleanValue": true}

// SELECT
{"selectedValue": "Option 1"}

// MULTI_SELECT
{"selectedValues": ["Option 1", "Option 3"]}
```

---

### roles

Defines system roles for RBAC.

**Columns**:
- `id` (BIGSERIAL, PK): Role identifier
- `name` (VARCHAR(50), UNIQUE, NOT NULL): Role name (ADMIN, HR_MANAGER, MANAGER, EMPLOYEE)
- `description` (TEXT, NULL): Role description
- `created_at`: Audit timestamp

**Default Roles**:
- **ADMIN**: System administrator with full access
- **HR_MANAGER**: HR manager with employee management access
- **MANAGER**: Team manager with team oversight
- **EMPLOYEE**: Standard employee access

---

### employee_roles

Junction table linking employees to roles (many-to-many).

**Columns**:
- `employee_id` (BIGINT, PK, FK): Employee
- `role_id` (BIGINT, PK, FK): Role
- `assigned_at` (TIMESTAMP, NOT NULL): When role was assigned
- `assigned_by` (BIGINT, NULL): Who assigned the role

**Constraints**:
- Composite PK on (employee_id, role_id)
- `fk_employee_roles_employee`: FK to `employees(id)` ON DELETE CASCADE
- `fk_employee_roles_role`: FK to `roles(id)` ON DELETE CASCADE

---

### permissions

Defines fine-grained permissions for resources and actions.

**Columns**:
- `id` (BIGSERIAL, PK): Permission identifier
- `name` (VARCHAR(100), UNIQUE, NOT NULL): Permission name (e.g., EMPLOYEE_CREATE)
- `resource` (VARCHAR(50), NOT NULL): Resource type (EMPLOYEE, PROJECT, TIMEOFF, etc.)
- `action` (VARCHAR(50), NOT NULL): Action type (CREATE, READ, UPDATE, DELETE, APPROVE)
- `description` (TEXT, NULL): What this permission allows

**Default Employee Permissions**:
- `EMPLOYEE_CREATE`: Create new employees
- `EMPLOYEE_READ`: View employee information
- `EMPLOYEE_UPDATE`: Update employee information
- `EMPLOYEE_DELETE`: Delete employees
- `EMPLOYEE_READ_ALL`: View all employees (vs just self/team)
- `EMPLOYEE_READ_TEAM`: View team members

---

### role_permissions

Junction table linking roles to permissions (many-to-many).

**Columns**:
- `role_id` (BIGINT, PK, FK): Role
- `permission_id` (BIGINT, PK, FK): Permission

**Constraints**:
- Composite PK on (role_id, permission_id)
- `fk_role_permissions_role`: FK to `roles(id)` ON DELETE CASCADE
- `fk_role_permissions_permission`: FK to `permissions(id)` ON DELETE CASCADE

**Default Assignments**:
- ADMIN → All permissions
- HR_MANAGER → EMPLOYEE_CREATE, EMPLOYEE_READ, EMPLOYEE_UPDATE, EMPLOYEE_READ_ALL
- MANAGER → EMPLOYEE_READ, EMPLOYEE_READ_TEAM
- EMPLOYEE → EMPLOYEE_READ

---

## Triggers

### update_updated_at_column()

Automatically updates the `updated_at` timestamp on UPDATE operations.

Applied to tables:
- employees
- employee_sections
- section_fields
- employee_field_values

**Example**:
```sql
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Performance Considerations

### GIN Indexes on JSONB

JSONB columns use GIN (Generalized Inverted Index) for fast queries:

```sql
CREATE INDEX idx_section_fields_options ON section_fields USING GIN (field_options);
CREATE INDEX idx_employee_field_values_value ON employee_field_values USING GIN (value);
```

**Query Example**:
```sql
-- Find all employees with a specific hobby
SELECT e.*
FROM employees e
JOIN employee_field_values efv ON e.id = efv.employee_id
JOIN section_fields sf ON efv.section_field_id = sf.id
WHERE sf.field_name = 'hobbies'
  AND efv.value @> '{"stringValue": "Photography"}';
```

### Hierarchical Queries

For employee org charts, use recursive CTEs:

```sql
WITH RECURSIVE employee_hierarchy AS (
    -- Base case: start with a specific employee
    SELECT id, first_name, last_name, reports_to_id, 1 as level
    FROM employees
    WHERE id = :employeeId

    UNION ALL

    -- Recursive case: get all subordinates
    SELECT e.id, e.first_name, e.last_name, e.reports_to_id, eh.level + 1
    FROM employees e
    INNER JOIN employee_hierarchy eh ON e.reports_to_id = eh.id
    WHERE eh.level < 10  -- Prevent infinite recursion
)
SELECT * FROM employee_hierarchy ORDER BY level, last_name;
```

---

## Time Off Tables (V4)

### time_off_types

Configurable leave categories. Soft-deleted via `is_active = false`.

**Columns**:
- `id` (BIGSERIAL, PK): Internal identifier
- `public_id` (UUID, NOT NULL, UNIQUE): API-facing identifier
- `name` (VARCHAR(100), NOT NULL): Display name (e.g., "Annual Leave")
- `description` (TEXT, NULL): Description of the leave type
- `default_days_per_year` (INTEGER, NOT NULL, DEFAULT 0): Default allocation for new employees
- `carry_over_allowed` (BOOLEAN, NOT NULL, DEFAULT false): Whether unused days carry over
- `max_carry_over_days` (INTEGER, NOT NULL, DEFAULT 0): Maximum carry-over days
- `requires_approval` (BOOLEAN, NOT NULL, DEFAULT true): Whether requests need manager approval
- `is_active` (BOOLEAN, NOT NULL, DEFAULT true): Soft-delete flag
- Audit fields: `version`, `created_at`, `updated_at`, `created_by`, `updated_by`

**Indexes**:
- Partial unique index on `name` WHERE `is_active = true` (allows re-creating names after soft-delete, added in V6)

**Default Data**: Annual Leave (20d), Sick Leave (10d), Maternity Leave (90d), Paternity Leave (10d), Bereavement Leave (5d), Personal Leave (3d), Unpaid Leave (0d)

---

### time_off_balances

Per-employee, per-type, per-year allocation tracking. Uses `NUMERIC(5,1)` to support half-day precision.

**Columns**:
- `id` (BIGSERIAL, PK): Internal identifier
- `public_id` (UUID, NOT NULL, UNIQUE): API-facing identifier
- `employee_id` (BIGINT, NOT NULL, FK): Employee
- `time_off_type_id` (BIGINT, NOT NULL, FK): Leave type
- `year` (INTEGER, NOT NULL): Calendar year
- `total_allocated` (NUMERIC(5,1), DEFAULT 0): Total days allocated
- `used` (NUMERIC(5,1), DEFAULT 0): Days used (approved requests)
- `pending` (NUMERIC(5,1), DEFAULT 0): Days in pending requests (denormalized for fast reads)
- `carry_over` (NUMERIC(5,1), DEFAULT 0): Days carried from previous year
- Audit fields: `version`, `created_at`, `updated_at`, `created_by`, `updated_by`

**Constraints**:
- `UNIQUE(employee_id, time_off_type_id, year)`
- `CHECK(total_allocated >= 0)`, `CHECK(used >= 0)`, `CHECK(pending >= 0)`, `CHECK(carry_over >= 0)`
- Balance integrity constraint (V6): `CHECK(used + pending <= total_allocated + carry_over)`

**Computed Fields** (Application-level):
- `remaining` = `total_allocated + carry_over - used - pending`

---

### time_off_requests

Leave requests with approval workflow. See ADR-013 for lifecycle details.

**Columns**:
- `id` (BIGSERIAL, PK): Internal identifier
- `public_id` (UUID, NOT NULL, UNIQUE): API-facing identifier
- `employee_id` (BIGINT, NOT NULL, FK): Requesting employee
- `time_off_type_id` (BIGINT, NOT NULL, FK): Leave type
- `start_date` (DATE, NOT NULL): First day of leave
- `end_date` (DATE, NOT NULL): Last day of leave
- `half_day` (BOOLEAN, DEFAULT false): Whether this is a half-day request
- `half_day_period` (VARCHAR(20), NULL): `MORNING` or `AFTERNOON` (required when `half_day = true`)
- `business_days` (NUMERIC(5,1), NOT NULL): Calculated business days (weekdays only; half-day = 0.5)
- `reason` (TEXT, NULL): Employee's reason for the request
- `status` (VARCHAR(20), DEFAULT 'PENDING'): Workflow status
- `reviewer_id` (BIGINT, NULL, FK): Employee who approved/rejected
- `review_note` (TEXT, NULL): Reviewer's comment
- `reviewed_at` (TIMESTAMP, NULL): When the review happened
- Audit fields: `version`, `created_at`, `updated_at`, `created_by`, `updated_by`

**Constraints**:
- `CHECK(end_date >= start_date)`
- `CHECK(half_day = false OR start_date = end_date)` — half-day must be a single day
- `CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'))`
- `CHECK(half_day_period IN ('MORNING', 'AFTERNOON'))` when not null

**Indexes**:
- `idx_time_off_requests_employee` on `employee_id`
- `idx_time_off_requests_status` on `status`
- `idx_time_off_requests_dates` on `(start_date, end_date)`

---

## Time Off Permissions (V4)

Added 12 permissions for time off management:

| Permission | Assigned To |
|-----------|-------------|
| `TIME_OFF_TYPE_CREATE` | ADMIN, HR_MANAGER |
| `TIME_OFF_TYPE_READ` | ADMIN, HR_MANAGER, MANAGER, EMPLOYEE |
| `TIME_OFF_TYPE_UPDATE` | ADMIN, HR_MANAGER |
| `TIME_OFF_TYPE_DELETE` | ADMIN |
| `TIME_OFF_REQUEST_CREATE` | ADMIN, HR_MANAGER, MANAGER, EMPLOYEE |
| `TIME_OFF_REQUEST_READ_OWN` | ADMIN, HR_MANAGER, MANAGER, EMPLOYEE |
| `TIME_OFF_REQUEST_READ_TEAM` | ADMIN, HR_MANAGER, MANAGER |
| `TIME_OFF_REQUEST_READ_ALL` | ADMIN, HR_MANAGER |
| `TIME_OFF_REQUEST_APPROVE` | ADMIN, HR_MANAGER, MANAGER |
| `TIME_OFF_BALANCE_READ_OWN` | ADMIN, HR_MANAGER, MANAGER, EMPLOYEE |
| `TIME_OFF_BALANCE_READ_ALL` | ADMIN, HR_MANAGER |
| `TIME_OFF_BALANCE_ADJUST` | ADMIN, HR_MANAGER |

---

## Future Tables (Planned)

### Time & Attendance
- `attendance_records`: Daily attendance tracking
- `time_entries`: Project time tracking

### Projects
- `clients`: Client information
- `projects`: Project details
- `project_assignments`: Employee-project assignments

### Documents
- `documents`: Document metadata (references SharePoint document IDs — see ADR-010)
- `document_signatures`: Digital signature tracking

### Communication
- `blog_posts`: Internal blog posts
- `blog_post_audiences`: Audience targeting for posts

---

## Backup & Recovery

### Daily Backups
```bash
pg_dump bonarda_hr > backup_$(date +%Y%m%d).sql
```

### Point-in-Time Recovery
PostgreSQL configured with WAL archiving for PITR capability.

---

## Migration Strategy

All schema changes go through Flyway migrations in:
```
backend/src/main/resources/db/migration/
```

**Naming Convention**:
```
V{version}__{description}.sql
```

**Current Migrations**:
| Version | File | Purpose |
|---------|------|---------|
| V1 | `create_employee_tables.sql` | Core schema: employees, sections, fields, roles, permissions, RBAC |
| V2 | `add_section_visibility.sql` | Section-level permissions (`required_permission` column) |
| V3 | `add_employee_public_id.sql` | UUID public identifiers for API exposure |
| V4 | `create_time_off_tables.sql` | Time off types, balances, requests, 12 new permissions |
| V5 | `grant_employee_read_all_to_employee_role.sql` | Grant `EMPLOYEE_READ_ALL` to EMPLOYEE role |
| V6 | `fix_time_off_constraints.sql` | Partial unique index on type name, balance integrity constraint |

**Never modify existing migrations** - always create new ones for changes.

---

## Security Considerations

1. **Row-Level Security (Future)**: Plan to implement RLS for multi-tenant support
2. **Encrypted Columns**: Sensitive data (SSN, salary) to be encrypted at rest
3. **Audit Logging**: All changes tracked via audit fields
4. **Access Control**: Database users with minimal required permissions
5. **Connection Pooling**: HikariCP with prepared statements to prevent SQL injection

---

## Monitoring & Maintenance

### Key Metrics to Monitor
- Table sizes and growth
- Index usage and bloat
- Slow query analysis
- Connection pool utilization
- JSONB field value sizes

### Regular Maintenance
- `VACUUM ANALYZE` weekly
- Index rebuild quarterly
- Statistics update after bulk operations
- Review and optimize slow queries monthly
