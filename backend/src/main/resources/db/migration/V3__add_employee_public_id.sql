-- V3__add_employee_public_id.sql
-- Add a UUID public identifier column to the employees table.
-- Internal BIGSERIAL 'id' remains the primary key for all FK relationships.
-- 'public_id' is the only identifier exposed via the API.

ALTER TABLE employees
    ADD COLUMN public_id UUID NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX idx_employees_public_id ON employees(public_id);
