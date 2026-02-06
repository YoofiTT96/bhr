import apiClient from '../../../api/apiClient';
import type {
  SharePointStatus,
  SharePointSite,
  SharePointDrive,
  SharePointItem,
  SharePointPreview,
} from '../types/document.types';

export const sharePointService = {
  getStatus: async (): Promise<SharePointStatus> => {
    const response = await apiClient.get('/sharepoint/status');
    return response.data;
  },

  getSites: async (): Promise<SharePointSite[]> => {
    const response = await apiClient.get('/sharepoint/sites');
    return response.data;
  },

  getDrives: async (siteId: string): Promise<SharePointDrive[]> => {
    const response = await apiClient.get(`/sharepoint/sites/${siteId}/drives`);
    return response.data;
  },

  getItems: async (siteId: string, driveId: string, folderId?: string): Promise<SharePointItem[]> => {
    const response = await apiClient.get(`/sharepoint/sites/${siteId}/drives/${driveId}/items`, {
      params: folderId ? { folderId } : undefined,
    });
    return response.data;
  },

  upload: async (driveId: string, file: File, folderId?: string): Promise<SharePointItem> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/sharepoint/drives/${driveId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: folderId ? { folderId } : undefined,
    });
    return response.data;
  },

  getPreviewUrl: async (driveId: string, itemId: string): Promise<SharePointPreview> => {
    const response = await apiClient.get(`/sharepoint/drives/${driveId}/items/${itemId}/preview`);
    return response.data;
  },
};
