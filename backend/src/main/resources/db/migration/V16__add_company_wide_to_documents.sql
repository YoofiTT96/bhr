-- V16: Add company_wide flag to documents
ALTER TABLE documents ADD COLUMN company_wide BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_documents_company_wide ON documents(company_wide);
