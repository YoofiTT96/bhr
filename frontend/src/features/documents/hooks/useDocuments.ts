import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/documentService';
import { sharePointService } from '../services/sharePointService';
import type {
  CreateDocumentRequest,
  ShareDocumentRequest,
  SignDocumentRequest,
  RequestSignatureRequest,
} from '../types/document.types';

// ===================== Document Queries =====================

export function useDocuments(page = 0, size = 20) {
  return useQuery({
    queryKey: ['documents', page, size],
    queryFn: () => documentService.getAll(page, size),
  });
}

export function useMyDocuments() {
  return useQuery({
    queryKey: ['documents', 'mine'],
    queryFn: () => documentService.getMyDocuments(),
  });
}

export function useCompanyWideDocuments(page = 0, size = 20) {
  return useQuery({
    queryKey: ['documents', 'company-wide', page, size],
    queryFn: () => documentService.getCompanyWideDocuments(page, size),
  });
}

export function useMyUploads() {
  return useQuery({
    queryKey: ['documents', 'my-uploads'],
    queryFn: () => documentService.getMyUploads(),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentService.getById(id),
    enabled: !!id,
  });
}

export function useDocumentShares(docId: string) {
  return useQuery({
    queryKey: ['documents', docId, 'shares'],
    queryFn: () => documentService.getShares(docId),
    enabled: !!docId,
  });
}

// ===================== Signature Queries =====================

export function usePendingSignatures() {
  return useQuery({
    queryKey: ['signatures', 'pending'],
    queryFn: () => documentService.getPendingSignatures(),
  });
}

export function useMySignatures() {
  return useQuery({
    queryKey: ['signatures', 'mine'],
    queryFn: () => documentService.getMySignatures(),
  });
}

export function useDocumentSignatures(docId: string) {
  return useQuery({
    queryKey: ['documents', docId, 'signatures'],
    queryFn: () => documentService.getDocumentSignatures(docId),
    enabled: !!docId,
  });
}

// ===================== SharePoint Queries =====================

export function useSharePointStatus() {
  return useQuery({
    queryKey: ['sharepoint', 'status'],
    queryFn: () => sharePointService.getStatus(),
  });
}

export function useSharePointSites() {
  return useQuery({
    queryKey: ['sharepoint', 'sites'],
    queryFn: () => sharePointService.getSites(),
  });
}

export function useSharePointDrives(siteId: string) {
  return useQuery({
    queryKey: ['sharepoint', 'drives', siteId],
    queryFn: () => sharePointService.getDrives(siteId),
    enabled: !!siteId,
  });
}

export function useSharePointItems(siteId: string, driveId: string, folderId?: string) {
  return useQuery({
    queryKey: ['sharepoint', 'items', siteId, driveId, folderId],
    queryFn: () => sharePointService.getItems(siteId, driveId, folderId),
    enabled: !!siteId && !!driveId,
  });
}

export function useDocumentPreview(driveId: string, itemId: string) {
  return useQuery({
    queryKey: ['sharepoint', 'preview', driveId, itemId],
    queryFn: () => sharePointService.getPreviewUrl(driveId, itemId),
    enabled: !!driveId && !!itemId,
  });
}

export function useSharePointUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ driveId, file, folderId }: { driveId: string; file: File; folderId?: string }) =>
      sharePointService.upload(driveId, file, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharepoint', 'items'] });
    },
  });
}

// ===================== Document Mutations =====================

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDocumentRequest) => documentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateDocumentRequest }) =>
      documentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useShareDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, data }: { docId: string; data: ShareDocumentRequest }) =>
      documentService.shareDocument(docId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.docId, 'shares'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useRemoveShare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, shareId }: { docId: string; shareId: string }) =>
      documentService.removeShare(docId, shareId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.docId, 'shares'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// ===================== Signature Mutations =====================

export function useSignDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sigId, data }: { sigId: string; data: SignDocumentRequest }) =>
      documentService.signDocument(sigId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signatures'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeclineSignature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sigId, reason }: { sigId: string; reason?: string }) =>
      documentService.declineSignature(sigId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signatures'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useRequestSignatures() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ docId, data }: { docId: string; data: RequestSignatureRequest }) =>
      documentService.requestSignatures(docId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.docId, 'signatures'] });
      queryClient.invalidateQueries({ queryKey: ['signatures'] });
    },
  });
}
