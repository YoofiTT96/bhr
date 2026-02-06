export type DocumentType = 'GENERAL' | 'POLICY' | 'CONTRACT' | 'ONBOARDING' | 'COMPLIANCE' | 'OTHER';
export type DocumentStatus = 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
export type SignatureStatus = 'PENDING' | 'SIGNED' | 'DECLINED';

// --- Document ---
export interface Document {
  id: string;
  title: string;
  description?: string | null;
  documentType: DocumentType;
  status: DocumentStatus;
  companyWide: boolean;
  requiresSignature: boolean;
  signatureDeadline?: string | null;
  sharepointSiteId?: string | null;
  sharepointDriveId?: string | null;
  sharepointItemId?: string | null;
  sharepointWebUrl?: string | null;
  sharepointFileName?: string | null;
  sharepointFileSize?: number | null;
  sharepointMimeType?: string | null;
  sharePointDocument: boolean;
  uploadedById: string;
  uploadedByName: string;
  shareCount: number;
  signedCount: number;
  pendingSignatureCount: number;
  mySignatureStatus?: SignatureStatus | null;
  mySignatureId?: string | null;
  createdAt: string;
}

export interface CreateDocumentRequest {
  title: string;
  description?: string;
  documentType?: DocumentType;
  companyWide?: boolean;
  requiresSignature?: boolean;
  signatureDeadline?: string;
  sharepointSiteId?: string;
  sharepointDriveId?: string;
  sharepointItemId?: string;
  sharepointWebUrl?: string;
  sharepointFileName?: string;
  sharepointFileSize?: number;
  sharepointMimeType?: string;
}

// --- Share ---
export interface DocumentShare {
  id: string;
  documentId: string;
  documentTitle: string;
  employeeId: string;
  employeeName: string;
  sharedById: string;
  sharedByName: string;
  viewedAt?: string | null;
  sharedAt: string;
}

export interface ShareDocumentRequest {
  employeeIds: string[];
}

// --- Signature ---
export interface DocumentSignature {
  id: string;
  documentId: string;
  documentTitle: string;
  documentSharepointUrl?: string | null;
  employeeId: string;
  employeeName: string;
  status: SignatureStatus;
  signedAt?: string | null;
  declineReason?: string | null;
  hasSignatureData: boolean;
  createdAt: string;
}

export interface SignDocumentRequest {
  signatureData: string;
}

export interface RequestSignatureRequest {
  employeeIds: string[];
}

// --- SharePoint ---
export interface SharePointSite {
  siteId: string;
  displayName: string;
  webUrl: string;
}

export interface SharePointDrive {
  driveId: string;
  name: string;
  driveType: string;
  webUrl: string;
}

export interface SharePointItem {
  itemId: string;
  name: string;
  webUrl: string;
  size: number;
  mimeType?: string | null;
  folder: boolean;
  lastModified?: string | null;
  lastModifiedBy?: string | null;
}

export interface SharePointLibrary {
  key: string;
  name: string;
  siteId: string;
  driveId: string;
  configured: boolean;
}

export interface SharePointPreview {
  previewUrl?: string | null;
  available: boolean;
}

export interface SharePointStatus {
  configured: boolean;
  libraries: SharePointLibrary[];
}
