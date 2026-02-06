-- =============================================
-- V8: Timesheet / Attendance Tables
-- =============================================

-- 1. Timesheets (weekly container per employee)
CREATE TABLE timesheets (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL DEFAULT gen_random_uuid(),
    employee_id BIGINT NOT NULL,
    week_start DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    total_hours NUMERIC(5,1) NOT NULL DEFAULT 0,
    submitted_at TIMESTAMP,
    reviewer_id BIGINT,
    review_note TEXT,
    reviewed_at TIMESTAMP,

    version BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,

    CONSTRAINT fk_timesheets_employee
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_timesheets_reviewer
        FOREIGN KEY (reviewer_id) REFERENCES employees(id) ON DELETE SET NULL,
    CONSTRAINT uq_employee_week
        UNIQUE (employee_id, week_start),
    CONSTRAINT chk_timesheet_status
        CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'))
);

CREATE UNIQUE INDEX idx_timesheets_public_id ON timesheets(public_id);
CREATE INDEX idx_timesheets_employee ON timesheets(employee_id);
CREATE INDEX idx_timesheets_status ON timesheets(status);
CREATE INDEX idx_timesheets_week_start ON timesheets(week_start);
CREATE INDEX idx_timesheets_reviewer ON timesheets(reviewer_id);

-- 2. Timesheet Entries (daily entry within a timesheet)
CREATE TABLE timesheet_entries (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL DEFAULT gen_random_uuid(),
    timesheet_id BIGINT NOT NULL,
    entry_date DATE NOT NULL,
    clock_in TIME,
    clock_out TIME,
    hours NUMERIC(4,1) NOT NULL,

    version BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,

    CONSTRAINT fk_timesheet_entries_timesheet
        FOREIGN KEY (timesheet_id) REFERENCES timesheets(id) ON DELETE CASCADE,
    CONSTRAINT uq_timesheet_entry_date
        UNIQUE (timesheet_id, entry_date),
    CONSTRAINT chk_hours_range
        CHECK (hours >= 0 AND hours <= 24)
);

CREATE UNIQUE INDEX idx_timesheet_entries_public_id ON timesheet_entries(public_id);
CREATE INDEX idx_timesheet_entries_timesheet ON timesheet_entries(timesheet_id);
CREATE INDEX idx_timesheet_entries_date ON timesheet_entries(entry_date);

-- 3. Triggers for updated_at
CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON timesheets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timesheet_entries_updated_at BEFORE UPDATE ON timesheet_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Seed: Timesheet Permissions
-- =============================================
INSERT INTO permissions (name, resource, action, description) VALUES
    ('TIMESHEET_CREATE',    'TIMESHEET', 'CREATE',    'Create and edit own timesheets'),
    ('TIMESHEET_READ_OWN',  'TIMESHEET', 'READ_OWN',  'View own timesheets'),
    ('TIMESHEET_READ_TEAM', 'TIMESHEET', 'READ_TEAM', 'View direct reports timesheets'),
    ('TIMESHEET_READ_ALL',  'TIMESHEET', 'READ_ALL',  'View all timesheets'),
    ('TIMESHEET_SUBMIT',    'TIMESHEET', 'SUBMIT',    'Submit own timesheet for approval'),
    ('TIMESHEET_APPROVE',   'TIMESHEET', 'APPROVE',   'Approve or reject team timesheets');

-- =============================================
-- Seed: Role-Permission Assignments
-- =============================================

-- ADMIN gets all timesheet permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ADMIN'
  AND p.resource = 'TIMESHEET';

-- HR_MANAGER gets all timesheet permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'HR_MANAGER'
  AND p.resource = 'TIMESHEET';

-- MANAGER gets CREATE, READ_OWN, READ_TEAM, SUBMIT, APPROVE
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'MANAGER'
  AND p.name IN (
    'TIMESHEET_CREATE', 'TIMESHEET_READ_OWN', 'TIMESHEET_READ_TEAM',
    'TIMESHEET_SUBMIT', 'TIMESHEET_APPROVE'
  );

-- EMPLOYEE gets CREATE, READ_OWN, SUBMIT
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'EMPLOYEE'
  AND p.name IN (
    'TIMESHEET_CREATE', 'TIMESHEET_READ_OWN', 'TIMESHEET_SUBMIT'
  );
