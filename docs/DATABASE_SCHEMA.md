# Database Schema Documentation

## Overview

The Nonnie HR System uses PostgreSQL 15+ as the database with Flyway for version-controlled migrations.

## Core Design Principles

1. **Hybrid Data Model**: Fixed columns for core fields + JSONB for configurable sections
2. **Audit Trail**: All main tables include created_at, updated_at, created_by, updated_by
3. **Soft Deletes**: Where appropriate, use status flags instead of hard deletes
4. **Referential Integrity**: Foreign keys with appropriate CASCADE/SET NULL actions
5. **Performance**: Indexes on foreign keys, search fields, and JSONB queries (GIN)

## Entity Relationship Overview

```
employees (1) ---- (N) employee_field_values
    |                       |
    | (self-ref)            |
    |                       |
    └─ reports_to       section_fields
                            |
                            |
                        employee_sections

employees (N) ---- (N) roles (via employee_roles)
    |
    |
roles (N) ---- (N) permissions (via role_permissions)
```

## Table Descriptions

### employees

Core employee information with fixed schema fields.

**Columns**:
- `id` (BIGSERIAL, PK): Unique employee identifier
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

**Indexes**:
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
- `created_at`, `updated_at`: Audit timestamps

**Indexes**:
- `idx_employee_sections_name` on `name`
- `idx_employee_sections_is_active` on `is_active`

**Default Data**:
- payroll: Payroll Information
- personal: Personal Interests
- emergency: Emergency Contact
- documents: Documents

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

## Future Tables (Planned)

### Time Management
- `time_off_types`: Leave types (annual, sick, personal)
- `time_off_balances`: Employee leave balances per year
- `time_off_requests`: Leave request workflow
- `attendance_records`: Daily attendance tracking
- `time_entries`: Project time tracking

### Projects
- `clients`: Client information
- `projects`: Project details
- `project_assignments`: Employee-project assignments

### Documents
- `documents`: Document metadata
- `document_signatures`: Digital signature tracking

### Communication
- `blog_posts`: Internal blog posts
- `blog_post_audiences`: Audience targeting for posts

---

## Backup & Recovery

### Daily Backups
```bash
pg_dump nonnie_hr > backup_$(date +%Y%m%d).sql
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

Examples:
V1__create_employee_tables.sql
V2__create_timeoff_tables.sql
V3__add_employee_profile_photo.sql
```

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
