-- =============================================
-- V9: Projects & Clients Tables
-- =============================================

-- 1. Clients (client organizations)
CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    industry VARCHAR(100),
    contact_name VARCHAR(200),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    website VARCHAR(500),
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,

    version BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

CREATE UNIQUE INDEX idx_clients_public_id ON clients(public_id);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_is_active ON clients(is_active);

-- 2. Projects (belong to a client)
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL DEFAULT gen_random_uuid(),
    client_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    start_date DATE,
    end_date DATE,
    budget NUMERIC(15,2),

    version BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,

    CONSTRAINT fk_projects_client
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT chk_project_status
        CHECK (status IN ('ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'))
);

CREATE UNIQUE INDEX idx_projects_public_id ON projects(public_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_name ON projects(name);

-- 3. Project Assignments (employees assigned to projects)
CREATE TABLE project_assignments (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL DEFAULT gen_random_uuid(),
    project_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    version BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,

    CONSTRAINT fk_project_assignments_project
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_assignments_employee
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT uq_project_employee
        UNIQUE (project_id, employee_id),
    CONSTRAINT chk_assignment_role
        CHECK (role IN ('LEAD', 'MEMBER'))
);

CREATE UNIQUE INDEX idx_project_assignments_public_id ON project_assignments(public_id);
CREATE INDEX idx_project_assignments_project ON project_assignments(project_id);
CREATE INDEX idx_project_assignments_employee ON project_assignments(employee_id);
CREATE INDEX idx_project_assignments_role ON project_assignments(role);

-- 4. Project Time Logs (hours logged per project per employee per day)
CREATE TABLE project_time_logs (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL DEFAULT gen_random_uuid(),
    project_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    log_date DATE NOT NULL,
    hours NUMERIC(4,1) NOT NULL,
    description TEXT,

    version BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,

    CONSTRAINT fk_project_time_logs_project
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_time_logs_employee
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT uq_project_employee_date
        UNIQUE (project_id, employee_id, log_date),
    CONSTRAINT chk_log_hours_range
        CHECK (hours > 0 AND hours <= 24)
);

CREATE UNIQUE INDEX idx_project_time_logs_public_id ON project_time_logs(public_id);
CREATE INDEX idx_project_time_logs_project ON project_time_logs(project_id);
CREATE INDEX idx_project_time_logs_employee ON project_time_logs(employee_id);
CREATE INDEX idx_project_time_logs_date ON project_time_logs(log_date);
CREATE INDEX idx_project_time_logs_project_date ON project_time_logs(project_id, log_date);

-- 5. Triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_assignments_updated_at BEFORE UPDATE ON project_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_time_logs_updated_at BEFORE UPDATE ON project_time_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Seed: Client & Project Permissions
-- =============================================
INSERT INTO permissions (name, resource, action, description) VALUES
    ('CLIENT_CREATE', 'CLIENT', 'CREATE', 'Create new clients'),
    ('CLIENT_READ',   'CLIENT', 'READ',   'View clients'),
    ('CLIENT_UPDATE', 'CLIENT', 'UPDATE', 'Update client information'),
    ('CLIENT_DELETE', 'CLIENT', 'DELETE', 'Delete clients'),
    ('PROJECT_CREATE', 'PROJECT', 'CREATE', 'Create new projects'),
    ('PROJECT_READ',   'PROJECT', 'READ',   'View projects'),
    ('PROJECT_UPDATE', 'PROJECT', 'UPDATE', 'Update project information'),
    ('PROJECT_DELETE', 'PROJECT', 'DELETE', 'Delete projects'),
    ('PROJECT_ASSIGN', 'PROJECT', 'ASSIGN', 'Assign employees to projects');

-- =============================================
-- Seed: Role-Permission Assignments
-- =============================================

-- ADMIN gets all client + project permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ADMIN'
  AND p.resource IN ('CLIENT', 'PROJECT');

-- HR_MANAGER gets all client + project permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'HR_MANAGER'
  AND p.resource IN ('CLIENT', 'PROJECT');

-- MANAGER gets CLIENT_READ + all project permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'MANAGER'
  AND (p.resource = 'PROJECT' OR p.name = 'CLIENT_READ');

-- EMPLOYEE gets CLIENT_READ + PROJECT_READ
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'EMPLOYEE'
  AND p.name IN ('CLIENT_READ', 'PROJECT_READ');
