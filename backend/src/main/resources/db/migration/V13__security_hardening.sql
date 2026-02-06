-- V13: Security hardening — audit logging, cascade fixes, constraint fixes, soft-delete support

-- ============================================================
-- 1. Audit logging table
-- ============================================================
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    actor_id BIGINT,
    actor_email VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_logs_actor
        FOREIGN KEY (actor_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================
-- 2. Soft-delete columns on key tables
-- ============================================================
ALTER TABLE employees ADD COLUMN deleted_at TIMESTAMP;
CREATE INDEX idx_employees_deleted_at ON employees(deleted_at);

ALTER TABLE documents ADD COLUMN deleted_at TIMESTAMP;
CREATE INDEX idx_documents_deleted_at ON documents(deleted_at);

ALTER TABLE clients ADD COLUMN deleted_at TIMESTAMP;
CREATE INDEX idx_clients_deleted_at ON clients(deleted_at);

ALTER TABLE projects ADD COLUMN deleted_at TIMESTAMP;
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at);

-- ============================================================
-- 3. Fix dangerous CASCADE deletes → SET NULL to preserve data
-- ============================================================

-- documents.uploaded_by_id: preserve documents when uploader is deleted
ALTER TABLE documents DROP CONSTRAINT fk_documents_uploaded_by;
ALTER TABLE documents ALTER COLUMN uploaded_by_id DROP NOT NULL;
ALTER TABLE documents ADD CONSTRAINT fk_documents_uploaded_by
    FOREIGN KEY (uploaded_by_id) REFERENCES employees(id) ON DELETE SET NULL;

-- project_time_logs.employee_id: preserve time logs when employee is deleted
ALTER TABLE project_time_logs DROP CONSTRAINT fk_project_time_logs_employee;
ALTER TABLE project_time_logs ALTER COLUMN employee_id DROP NOT NULL;
ALTER TABLE project_time_logs ADD CONSTRAINT fk_project_time_logs_employee
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL;

-- project_assignments.employee_id: preserve assignments when employee is deleted
ALTER TABLE project_assignments DROP CONSTRAINT fk_project_assignments_employee;
ALTER TABLE project_assignments ALTER COLUMN employee_id DROP NOT NULL;
ALTER TABLE project_assignments ADD CONSTRAINT fk_project_assignments_employee
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Drop old unique constraints and recreate as partial indexes (nullable-safe)
ALTER TABLE project_time_logs DROP CONSTRAINT IF EXISTS uq_project_employee_date;
CREATE UNIQUE INDEX uq_project_employee_date ON project_time_logs(project_id, employee_id, log_date)
    WHERE employee_id IS NOT NULL;

ALTER TABLE project_assignments DROP CONSTRAINT IF EXISTS uq_project_employee;
CREATE UNIQUE INDEX uq_project_employee ON project_assignments(project_id, employee_id)
    WHERE employee_id IS NOT NULL;

-- ============================================================
-- 4. Fix half-day constraint: require half_day_period when half_day is true
-- ============================================================
ALTER TABLE time_off_requests DROP CONSTRAINT IF EXISTS chk_half_day_single_day;
ALTER TABLE time_off_requests ADD CONSTRAINT chk_half_day_rules
    CHECK (
        (half_day = false)
        OR (half_day_period IS NOT NULL AND start_date = end_date)
    );

-- ============================================================
-- 5. Missing indexes for common query patterns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_time_off_requests_employee_status
    ON time_off_requests(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_document_signatures_doc_status
    ON document_signatures(document_id, status);
