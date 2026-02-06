-- Add public_id to roles for API consistency (ADR-012)
ALTER TABLE roles ADD COLUMN public_id UUID NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX idx_roles_public_id ON roles(public_id);

-- Add public_id to permissions for API consistency (ADR-012)
ALTER TABLE permissions ADD COLUMN public_id UUID NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX idx_permissions_public_id ON permissions(public_id);

-- Admin permissions for role management
INSERT INTO permissions (name, resource, action, description) VALUES
    ('ROLE_READ',   'ROLE', 'READ',   'View roles and permissions'),
    ('ROLE_CREATE', 'ROLE', 'CREATE', 'Create new roles'),
    ('ROLE_UPDATE', 'ROLE', 'UPDATE', 'Update roles and their permissions'),
    ('ROLE_DELETE', 'ROLE', 'DELETE', 'Delete roles'),
    ('ROLE_ASSIGN', 'ROLE', 'ASSIGN', 'Assign roles to employees');

-- Only ADMIN gets these permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN' AND p.resource = 'ROLE';
