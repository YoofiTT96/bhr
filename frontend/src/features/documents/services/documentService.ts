import apiClient from '../../../api/apiClient';
import type { PagedResponse } from '../../../shared/types/common.types';
import type {
  Document,
  CreateDocumentRequest,
  DocumentShare,
  ShareDocumentRequest,
  DocumentSignature,
  SignDocumentRequest,
  RequestSignatureRequest,
} from '../types/document.types';

export const documentService = {
  // --- Documents ---
  getAll: async (page = 0, size = 20): Promise<PagedResponse<Document>> => {
    const response = await apiClient.get('/documents', { params: { page, size } });
    return response.data;
  },

  getMyDocuments: async (): Promise<Document[]> => {
    const response = await apiClient.get('/documents/me');
    return response.data;
  },

  getCompanyWideDocuments: async (page = 0, size = 20): Promise<PagedResponse<Document>> => {
    const response = await apiClient.get('/documents/company-wide', { params: { page, size } });
    return response.data;
  },

  getMyUploads: async (): Promise<Document[]> => {
    const response = await apiClient.get('/documents/my-uploads');
    return response.data;
  },

  getById: async (id: string): Promise<Document> => {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  },

  create: async (data: CreateDocumentRequest): Promise<Document> => {
    const response = await apiClient.post('/documents', data);
    return response.data;
  },

  update: async (id: string, data: CreateDocumentRequest): Promise<Document> => {
    const response = await apiClient.put(`/documents/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },

  markViewed: async (id: string): Promise<void> => {
    await apiClient.post(`/documents/${id}/viewed`);
  },

  // --- Shares ---
  shareDocument: async (id: string, data: ShareDocumentRequest): Promise<DocumentShare[]> => {
    const response = await apiClient.post(`/documents/${id}/shares`, data);
    return response.data;
  },

  getShares: async (id: string): Promise<DocumentShare[]> => {
    const response = await apiClient.get(`/documents/${id}/shares`);
    return response.data;
  },

  removeShare: async (docId: string, shareId: string): Promise<void> => {
    await apiClient.delete(`/documents/${docId}/shares/${shareId}`);
  },

  // --- Signatures ---
  getPendingSignatures: async (): Promise<DocumentSignature[]> => {
    const response = await apiClient.get('/document-signatures/me/pending');
    return response.data;
  },

  getMySignatures: async (): Promise<DocumentSignature[]> => {
    const response = await apiClient.get('/document-signatures/me');
    return response.data;
  },

  getDocumentSignatures: async (docId: string): Promise<DocumentSignature[]> => {
    const response = await apiClient.get(`/document-signatures/document/${docId}`);
    return response.data;
  },

  signDocument: async (sigId: string, data: SignDocumentRequest): Promise<DocumentSignature> => {
    const response = await apiClient.post(`/document-signatures/${sigId}/sign`, data);
    return response.data;
  },

  declineSignature: async (sigId: string, declineReason?: string): Promise<DocumentSignature> => {
    const response = await apiClient.post(`/document-signatures/${sigId}/decline`, { declineReason });
    return response.data;
  },

  requestSignatures: async (docId: string, data: RequestSignatureRequest): Promise<DocumentSignature[]> => {
    const response = await apiClient.post(`/document-signatures/document/${docId}/request`, data);
    return response.data;
  },
};
