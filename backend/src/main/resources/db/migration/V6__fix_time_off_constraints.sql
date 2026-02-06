-- =============================================
-- V6: Fix time off constraints
-- =============================================

-- 1. Replace absolute UNIQUE on name with partial unique index
--    so soft-deleted types don't block creating new types with the same name
ALTER TABLE time_off_types DROP CONSTRAINT time_off_types_name_key;
CREATE UNIQUE INDEX idx_time_off_types_name_active ON time_off_types(name) WHERE is_active = true;

-- 2. Add balance integrity constraint:
--    allocated + carry_over must cover used + pending
ALTER TABLE time_off_balances ADD CONSTRAINT chk_balance_sufficient
    CHECK ((total_allocated + carry_over) >= (used + pending));
