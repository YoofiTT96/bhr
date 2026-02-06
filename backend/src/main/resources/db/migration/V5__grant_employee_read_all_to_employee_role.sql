-- Grant EMPLOYEE_READ_ALL to the EMPLOYEE role so all users can see the employee list
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'EMPLOYEE'
AND p.name = 'EMPLOYEE_READ_ALL'
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
