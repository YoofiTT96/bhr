-- V1__create_employee_tables.sql
-- Initial schema for employee management with configurable sections

-- Main employee table with core fixed fields
CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    position VARCHAR(100),
    location VARCHAR(100),
    birthday DATE,
    hire_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    reports_to_id BIGINT,

    -- Microsoft integration
    microsoft_user_id VARCHAR(255) UNIQUE,

    -- Audit fields
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,

    CONSTRAINT fk_employees_reports_to
        FOREIGN KEY (reports_to_id)
        REFERENCES employees(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_employee_status
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'))
);

-- Indexes for employee table
CREATE INDEX idx_employees_reports_to ON employees(reports_to_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_hire_date ON employees(hire_date);
CREATE INDEX idx_employees_microsoft_user_id ON employees(microsoft_user_id);

-- Employee sections (configurable categories like "Payroll", "Hobbies", etc.)
CREATE TABLE employee_sections (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employee_sections_name ON employee_sections(name);
CREATE INDEX idx_employee_sections_is_active ON employee_sections(is_active);

-- Field definitions for sections (schema for dynamic fields)
CREATE TABLE section_fields (
    id BIGSERIAL PRIMARY KEY,
    section_id BIGINT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    field_options JSONB,
    is_required BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    validation_rules JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_section_fields_section
        FOREIGN KEY (section_id)
        REFERENCES employee_sections(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_section_field_name
        UNIQUE (section_id, field_name),

    CONSTRAINT chk_field_type
        CHECK (field_type IN ('TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'SELECT', 'MULTI_SELECT'))
);

CREATE INDEX idx_section_fields_section ON section_fields(section_id);

-- GIN index for JSONB field options
CREATE INDEX idx_section_fields_options ON section_fields USING GIN (field_options);

-- Employee field values (actual data for configurable fields)
CREATE TABLE employee_field_values (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    section_field_id BIGINT NOT NULL,
    value JSONB NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_employee_field_values_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_employee_field_values_field
        FOREIGN KEY (section_field_id)
        REFERENCES section_fields(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_employee_field
        UNIQUE (employee_id, section_field_id)
);

CREATE INDEX idx_employee_field_values_employee ON employee_field_values(employee_id);
CREATE INDEX idx_employee_field_values_field ON employee_field_values(section_field_id);

-- GIN index for JSONB value queries
CREATE INDEX idx_employee_field_values_value ON employee_field_values USING GIN (value);

-- Roles for RBAC
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Employee role assignments
CREATE TABLE employee_roles (
    employee_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT,

    PRIMARY KEY (employee_id, role_id),

    CONSTRAINT fk_employee_roles_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_employee_roles_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE
);

-- Permissions
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT
);

-- Role permissions mapping
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,

    PRIMARY KEY (role_id, permission_id),

    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (permission_id)
        REFERENCES permissions(id)
        ON DELETE CASCADE
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('ADMIN', 'System administrator with full access'),
    ('HR_MANAGER', 'HR manager with employee management access'),
    ('MANAGER', 'Team manager with team oversight'),
    ('EMPLOYEE', 'Standard employee access');

-- Insert default permissions for employee management
INSERT INTO permissions (name, resource, action, description) VALUES
    ('EMPLOYEE_CREATE', 'EMPLOYEE', 'CREATE', 'Create new employees'),
    ('EMPLOYEE_READ', 'EMPLOYEE', 'READ', 'View employee information'),
    ('EMPLOYEE_UPDATE', 'EMPLOYEE', 'UPDATE', 'Update employee information'),
    ('EMPLOYEE_DELETE', 'EMPLOYEE', 'DELETE', 'Delete employees'),
    ('EMPLOYEE_READ_ALL', 'EMPLOYEE', 'READ_ALL', 'View all employees'),
    ('EMPLOYEE_READ_TEAM', 'EMPLOYEE', 'READ_TEAM', 'View team members');

-- Assign permissions to roles
-- ADMIN gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ADMIN';

-- HR_MANAGER gets most permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'HR_MANAGER'
AND p.name IN ('EMPLOYEE_CREATE', 'EMPLOYEE_READ', 'EMPLOYEE_UPDATE', 'EMPLOYEE_READ_ALL');

-- MANAGER gets read permissions for team
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'MANAGER'
AND p.name IN ('EMPLOYEE_READ', 'EMPLOYEE_READ_TEAM');

-- EMPLOYEE gets basic read permission
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'EMPLOYEE'
AND p.name = 'EMPLOYEE_READ';

-- Insert default employee sections
INSERT INTO employee_sections (name, display_name, description, display_order) VALUES
    ('payroll', 'Payroll Information', 'Salary and compensation details', 1),
    ('personal', 'Personal Interests', 'Hobbies and personal information', 2),
    ('emergency', 'Emergency Contact', 'Emergency contact information', 3),
    ('documents', 'Documents', 'Personal documents and certificates', 4);

-- Insert sample fields for emergency contact section
INSERT INTO section_fields (section_id, field_name, field_label, field_type, is_required, display_order)
SELECT
    id,
    'emergency_contact_name',
    'Emergency Contact Name',
    'TEXT',
    true,
    1
FROM employee_sections WHERE name = 'emergency';

INSERT INTO section_fields (section_id, field_name, field_label, field_type, is_required, display_order)
SELECT
    id,
    'emergency_contact_phone',
    'Emergency Contact Phone',
    'TEXT',
    true,
    2
FROM employee_sections WHERE name = 'emergency';

INSERT INTO section_fields (section_id, field_name, field_label, field_type, is_required, display_order)
SELECT
    id,
    'emergency_contact_relationship',
    'Relationship',
    'SELECT',
    true,
    3
FROM employee_sections WHERE name = 'emergency';

-- Update the emergency contact relationship field with options
UPDATE section_fields
SET field_options = '{"options": ["Spouse", "Parent", "Sibling", "Child", "Friend", "Other"]}'::jsonb
WHERE field_name = 'emergency_contact_relationship';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_sections_updated_at BEFORE UPDATE ON employee_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_section_fields_updated_at BEFORE UPDATE ON section_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_field_values_updated_at BEFORE UPDATE ON employee_field_values
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
