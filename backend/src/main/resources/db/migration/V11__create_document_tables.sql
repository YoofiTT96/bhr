-- =============================================
-- V11: Document Management & Signing Tables
-- =============================================

-- 1. Documents (metadata for tracked documents)
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    document_type VARCHAR(30) NOT NULL DEFAULT 'GENERAL',

    -- SharePoint integration (nullable for non-SharePoint docs)
    sharepoint_site_id VARCHAR(255),
    sharepoint_drive_id VARCHAR(255),
    sharepoint_item_id VARCHAR(255),
    sharepoint_web_url VARCHAR(2000),
    sharepoint_file_name VARCHAR(500),
    sharepoint_file_size BIGINT,
    sharepoint_mime_type VARCHAR(255),

    -- Signature tracking
    requires_signature BOOLEAN NOT NULL DEFAULT false,
    signature_deadline DATE,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    -- Who uploaded/created the reference
    uploaded_by_id BIGINT NOT NULL,

    version BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,

    CONSTRAINT fk_documents_uploaded_by
        FOREIGN KEY (uploaded_by_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT chk_document_type
        CHECK (document_type IN ('GENERAL', 'POLICY', 'CONTRACT', 'ONBOARDING', 'COMPLIANCE', 'OTHER')),
    CONSTRAINT chk_document_status
        CHECK (status IN ('ACTIVE', 'ARCHIVED', 'DRAFT'))
);

CREATE UNIQUE INDEX idx_documents_public_id ON documents(public_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_requires_signature ON documents(requires_signature);

-- 2. Document Shares (who can see which document)
CREATE TABLE document_shares (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL DEFAULT gen_random_uuid(),
    document_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    shared_by_id BIGINT NOT NULL,

    -- Tracking
    viewed_at TIMESTAMP,

    version BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,

    CONSTRAINT fk_document_shares_document
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_shares_employee
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_shares_shared_by
        FOREIGN KEY (shared_by_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT uq_document_employee
        UNIQUE (document_id, employee_id)
);

CREATE UNIQUE INDEX idx_document_shares_public_id ON document_shares(public_id);
CREATE INDEX idx_document_shares_document ON document_shares(document_id);
CREATE INDEX idx_document_shares_employee ON document_shares(employee_id);

-- 3. Document Signatures (e-signature records)
CREATE TABLE document_signatures (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL DEFAULT gen_random_uuid(),
    document_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,

    -- Signature data
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    signature_data TEXT,
    signed_at TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),

    -- Decline support
    decline_reason TEXT,

    version BIGINT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,

    CONSTRAINT fk_document_signatures_document
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_signatures_employee
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT uq_document_signature_employee
        UNIQUE (document_id, employee_id),
    CONSTRAINT chk_signature_status
        CHECK (status IN ('PENDING', 'SIGNED', 'DECLINED'))
);

CREATE UNIQUE INDEX idx_document_signatures_public_id ON document_signatures(public_id);
CREATE INDEX idx_document_signatures_document ON document_signatures(document_id);
CREATE INDEX idx_document_signatures_employee ON document_signatures(employee_id);
CREATE INDEX idx_document_signatures_status ON document_signatures(status);

-- 4. Triggers for updated_at
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_shares_updated_at BEFORE UPDATE ON document_shares
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_signatures_updated_at BEFORE UPDATE ON document_signatures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Seed: Document Permissions
-- =============================================
INSERT INTO permissions (name, resource, action, description) VALUES
    ('DOCUMENT_CREATE',     'DOCUMENT',   'CREATE',     'Create/upload documents'),
    ('DOCUMENT_READ_OWN',   'DOCUMENT',   'READ_OWN',   'View own shared documents'),
    ('DOCUMENT_READ_ALL',   'DOCUMENT',   'READ_ALL',   'View all documents'),
    ('DOCUMENT_UPDATE',     'DOCUMENT',   'UPDATE',      'Update document metadata'),
    ('DOCUMENT_DELETE',     'DOCUMENT',   'DELETE',      'Delete documents'),
    ('DOCUMENT_SHARE',      'DOCUMENT',   'SHARE',       'Share documents with employees'),
    ('DOCUMENT_SIGN_OWN',   'DOCUMENT',   'SIGN_OWN',   'Sign documents assigned to self'),
    ('DOCUMENT_SIGN_READ',  'DOCUMENT',   'SIGN_READ',  'View all signature statuses'),
    ('SHAREPOINT_BROWSE',   'SHAREPOINT', 'BROWSE',     'Browse SharePoint sites and files');

-- =============================================
-- Seed: Role-Permission Assignments
-- =============================================

-- ADMIN gets all document permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'ADMIN'
  AND p.resource IN ('DOCUMENT', 'SHAREPOINT');

-- HR_MANAGER gets all document permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'HR_MANAGER'
  AND p.resource IN ('DOCUMENT', 'SHAREPOINT');

-- MANAGER gets READ_OWN, SIGN_OWN, SIGN_READ
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'MANAGER'
  AND p.name IN ('DOCUMENT_READ_OWN', 'DOCUMENT_SIGN_OWN', 'DOCUMENT_SIGN_READ');

-- EMPLOYEE gets READ_OWN, SIGN_OWN only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'EMPLOYEE'
  AND p.name IN ('DOCUMENT_READ_OWN', 'DOCUMENT_SIGN_OWN');
