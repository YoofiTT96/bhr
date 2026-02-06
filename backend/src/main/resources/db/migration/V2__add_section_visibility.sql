-- V2__add_section_visibility.sql
-- Add per-section visibility controls based on permissions

-- 1. Add required_permission column to employee_sections
-- NULL means visible to all; a value means the section is only visible
-- when viewing your own profile OR when you have that permission
ALTER TABLE employee_sections
    ADD COLUMN required_permission VARCHAR(100);

-- 2. Insert new section-view permissions
INSERT INTO permissions (name, resource, action, description) VALUES
    ('SECTION_PAYROLL_VIEW', 'SECTION', 'VIEW', 'View payroll section for any employee'),
    ('SECTION_EMERGENCY_VIEW', 'SECTION', 'VIEW', 'View emergency contact section for any employee'),
    ('SECTION_DOCUMENTS_VIEW', 'SECTION', 'VIEW', 'View documents section for any employee');

-- 3. Assign all three new permissions to ADMIN role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ADMIN'
AND p.name IN ('SECTION_PAYROLL_VIEW', 'SECTION_EMERGENCY_VIEW', 'SECTION_DOCUMENTS_VIEW');

-- 4. Assign all three new permissions to HR_MANAGER role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'HR_MANAGER'
AND p.name IN ('SECTION_PAYROLL_VIEW', 'SECTION_EMERGENCY_VIEW', 'SECTION_DOCUMENTS_VIEW');

-- 5. Set required_permission on restricted sections
-- personal section stays NULL = visible to all
UPDATE employee_sections SET required_permission = 'SECTION_PAYROLL_VIEW' WHERE name = 'payroll';
UPDATE employee_sections SET required_permission = 'SECTION_EMERGENCY_VIEW' WHERE name = 'emergency';
UPDATE employee_sections SET required_permission = 'SECTION_DOCUMENTS_VIEW' WHERE name = 'documents';
