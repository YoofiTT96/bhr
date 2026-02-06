-- =============================================
-- V4: Time Off Management Tables
-- =============================================

-- 1. Time Off Types (configurable leave categories)
CREATE TABLE time_off_types (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    default_days_per_year INTEGER NOT NULL DEFAULT 0,
    carry_over_allowed BOOLEAN NOT NULL DEFAULT false,
    max_carry_over_days INTEGER NOT NULL DEFAULT 0,
    requires_approval BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,

    version BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

CREATE UNIQUE INDEX idx_time_off_types_public_id ON time_off_types(public_id);
CREATE INDEX idx_time_off_types_is_active ON time_off_types(is_active);

-- 2. Time Off Balances (per-employee, per-type, per-year)
CREATE TABLE time_off_balances (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL DEFAULT gen_random_uuid(),
    employee_id BIGINT NOT NULL,
    time_off_type_id BIGINT NOT NULL,
    year INTEGER NOT NULL,
    total_allocated NUMERIC(5,1) NOT NULL DEFAULT 0,
    used NUMERIC(5,1) NOT NULL DEFAULT 0,
    pending NUMERIC(5,1) NOT NULL DEFAULT 0,
    carry_over NUMERIC(5,1) NOT NULL DEFAULT 0,

    version BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,

    CONSTRAINT fk_time_off_balances_employee
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_time_off_balances_type
        FOREIGN KEY (time_off_type_id) REFERENCES time_off_types(id) ON DELETE CASCADE,
    CONSTRAINT uq_employee_type_year
        UNIQUE (employee_id, time_off_type_id, year),
    CONSTRAINT chk_balance_non_negative
        CHECK (total_allocated >= 0 AND used >= 0 AND pending >= 0 AND carry_over >= 0)
);

CREATE UNIQUE INDEX idx_time_off_balances_public_id ON time_off_balances(public_id);
CREATE INDEX idx_time_off_balances_employee ON time_off_balances(employee_id);
CREATE INDEX idx_time_off_balances_type ON time_off_balances(time_off_type_id);
CREATE INDEX idx_time_off_balances_year ON time_off_balances(year);

-- 3. Time Off Requests (leave requests with approval workflow)
CREATE TABLE time_off_requests (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL DEFAULT gen_random_uuid(),
    employee_id BIGINT NOT NULL,
    time_off_type_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    half_day BOOLEAN NOT NULL DEFAULT false,
    half_day_period VARCHAR(20),
    business_days NUMERIC(5,1) NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reviewer_id BIGINT,
    review_note TEXT,
    reviewed_at TIMESTAMP,

    version BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,

    CONSTRAINT fk_time_off_requests_employee
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_time_off_requests_type
        FOREIGN KEY (time_off_type_id) REFERENCES time_off_types(id) ON DELETE RESTRICT,
    CONSTRAINT fk_time_off_requests_reviewer
        FOREIGN KEY (reviewer_id) REFERENCES employees(id) ON DELETE SET NULL,
    CONSTRAINT chk_request_status
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    CONSTRAINT chk_half_day_period
        CHECK (half_day_period IS NULL OR half_day_period IN ('MORNING', 'AFTERNOON')),
    CONSTRAINT chk_dates
        CHECK (end_date >= start_date),
    CONSTRAINT chk_half_day_single_day
        CHECK (half_day = false OR start_date = end_date),
    CONSTRAINT chk_business_days_positive
        CHECK (business_days > 0)
);

CREATE UNIQUE INDEX idx_time_off_requests_public_id ON time_off_requests(public_id);
CREATE INDEX idx_time_off_requests_employee ON time_off_requests(employee_id);
CREATE INDEX idx_time_off_requests_type ON time_off_requests(time_off_type_id);
CREATE INDEX idx_time_off_requests_status ON time_off_requests(status);
CREATE INDEX idx_time_off_requests_dates ON time_off_requests(start_date, end_date);
CREATE INDEX idx_time_off_requests_reviewer ON time_off_requests(reviewer_id);

-- 4. Triggers for updated_at
CREATE TRIGGER update_time_off_types_updated_at BEFORE UPDATE ON time_off_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_off_balances_updated_at BEFORE UPDATE ON time_off_balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_off_requests_updated_at BEFORE UPDATE ON time_off_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Seed: Default Time Off Types
-- =============================================
INSERT INTO time_off_types (name, description, default_days_per_year, carry_over_allowed, max_carry_over_days, requires_approval) VALUES
    ('Annual Leave', 'Standard annual vacation leave', 20, true, 5, true),
    ('Sick Leave', 'Leave due to illness', 10, false, 0, true),
    ('Maternity Leave', 'Maternity leave for new mothers', 90, false, 0, true),
    ('Paternity Leave', 'Paternity leave for new fathers', 10, false, 0, true),
    ('Bereavement Leave', 'Leave due to death of close family member', 5, false, 0, true),
    ('Personal Leave', 'Personal time off for personal matters', 3, false, 0, true),
    ('Unpaid Leave', 'Leave without pay', 0, false, 0, true);

-- =============================================
-- Seed: Time Off Permissions
-- =============================================
INSERT INTO permissions (name, resource, action, description) VALUES
    ('TIME_OFF_TYPE_CREATE', 'TIME_OFF_TYPE', 'CREATE', 'Create time off types'),
    ('TIME_OFF_TYPE_READ', 'TIME_OFF_TYPE', 'READ', 'View time off types'),
    ('TIME_OFF_TYPE_UPDATE', 'TIME_OFF_TYPE', 'UPDATE', 'Update time off types'),
    ('TIME_OFF_TYPE_DELETE', 'TIME_OFF_TYPE', 'DELETE', 'Delete time off types'),
    ('TIME_OFF_REQUEST_CREATE', 'TIME_OFF_REQUEST', 'CREATE', 'Submit time off requests'),
    ('TIME_OFF_REQUEST_READ_OWN', 'TIME_OFF_REQUEST', 'READ_OWN', 'View own time off requests'),
    ('TIME_OFF_REQUEST_READ_TEAM', 'TIME_OFF_REQUEST', 'READ_TEAM', 'View team time off requests'),
    ('TIME_OFF_REQUEST_READ_ALL', 'TIME_OFF_REQUEST', 'READ_ALL', 'View all time off requests'),
    ('TIME_OFF_REQUEST_APPROVE', 'TIME_OFF_REQUEST', 'APPROVE', 'Approve or reject time off requests'),
    ('TIME_OFF_BALANCE_READ_OWN', 'TIME_OFF_BALANCE', 'READ_OWN', 'View own time off balances'),
    ('TIME_OFF_BALANCE_READ_ALL', 'TIME_OFF_BALANCE', 'READ_ALL', 'View all time off balances'),
    ('TIME_OFF_BALANCE_ADJUST', 'TIME_OFF_BALANCE', 'ADJUST', 'Manually adjust time off balances');

-- =============================================
-- Seed: Role-Permission Assignments
-- =============================================

-- ADMIN gets all time off permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ADMIN'
  AND p.resource IN ('TIME_OFF_TYPE', 'TIME_OFF_REQUEST', 'TIME_OFF_BALANCE');

-- HR_MANAGER gets all except type delete
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'HR_MANAGER'
  AND p.name IN (
    'TIME_OFF_TYPE_READ', 'TIME_OFF_TYPE_CREATE', 'TIME_OFF_TYPE_UPDATE',
    'TIME_OFF_REQUEST_CREATE', 'TIME_OFF_REQUEST_READ_OWN', 'TIME_OFF_REQUEST_READ_ALL',
    'TIME_OFF_REQUEST_APPROVE',
    'TIME_OFF_BALANCE_READ_OWN', 'TIME_OFF_BALANCE_READ_ALL', 'TIME_OFF_BALANCE_ADJUST'
  );

-- MANAGER gets team and own access + approve
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'MANAGER'
  AND p.name IN (
    'TIME_OFF_TYPE_READ',
    'TIME_OFF_REQUEST_CREATE', 'TIME_OFF_REQUEST_READ_OWN', 'TIME_OFF_REQUEST_READ_TEAM',
    'TIME_OFF_REQUEST_APPROVE',
    'TIME_OFF_BALANCE_READ_OWN'
  );

-- EMPLOYEE gets own access only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'EMPLOYEE'
  AND p.name IN (
    'TIME_OFF_TYPE_READ',
    'TIME_OFF_REQUEST_CREATE', 'TIME_OFF_REQUEST_READ_OWN',
    'TIME_OFF_BALANCE_READ_OWN'
  );
