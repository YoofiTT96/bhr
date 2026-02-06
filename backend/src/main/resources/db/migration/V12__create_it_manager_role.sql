-- Create IT_MANAGER role with all admin permissions
INSERT INTO roles (name, description, public_id)
VALUES ('IT_MANAGER', 'IT manager with full administrative access', gen_random_uuid());

-- Give IT_MANAGER all permissions that ADMIN has
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, rp.permission_id
FROM roles r, role_permissions rp
JOIN roles admin_role ON rp.role_id = admin_role.id AND admin_role.name = 'ADMIN'
WHERE r.name = 'IT_MANAGER';

-- Remove EMPLOYEE_CREATE from HR_MANAGER (only ADMIN and IT_MANAGER should have it)
DELETE FROM role_permissions
WHERE role_id = (SELECT id FROM roles WHERE name = 'HR_MANAGER')
  AND permission_id = (SELECT id FROM permissions WHERE name = 'EMPLOYEE_CREATE');
