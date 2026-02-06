-- V15: Company Events + Dashboard permissions

CREATE TABLE company_events (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    event_type VARCHAR(50) NOT NULL,
    created_by_employee_id BIGINT,
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT fk_company_events_creator
        FOREIGN KEY (created_by_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    CONSTRAINT chk_event_type
        CHECK (event_type IN ('MEETING', 'CELEBRATION', 'TRAINING', 'COMPANY_WIDE', 'SOCIAL', 'OTHER')),
    CONSTRAINT chk_event_times
        CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time)
);

CREATE UNIQUE INDEX idx_company_events_public_id ON company_events(public_id);
CREATE INDEX idx_company_events_event_date ON company_events(event_date);

CREATE TRIGGER update_company_events_updated_at BEFORE UPDATE ON company_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Permissions
INSERT INTO permissions (name, resource, action, description) VALUES
    ('EVENT_CREATE', 'EVENT', 'CREATE', 'Create company events'),
    ('EVENT_READ',   'EVENT', 'READ',   'View company events'),
    ('EVENT_UPDATE', 'EVENT', 'UPDATE', 'Update company events'),
    ('EVENT_DELETE', 'EVENT', 'DELETE', 'Delete company events');

-- EVENT_READ to ALL roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE p.name = 'EVENT_READ';

-- EVENT_CREATE, EVENT_UPDATE, EVENT_DELETE to ADMIN and HR_MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN'
  AND p.name IN ('EVENT_CREATE', 'EVENT_UPDATE', 'EVENT_DELETE');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'HR_MANAGER'
  AND p.name IN ('EVENT_CREATE', 'EVENT_UPDATE', 'EVENT_DELETE');
