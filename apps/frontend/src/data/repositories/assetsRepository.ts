import { apiClient } from '../apiClient';
import {
  AssetResponse,
  ItAsset,
  AssetHandover,
  CreateAssetDto,
  UpdateAssetDto,
  CreateHandoverDto,
} from '../../domain/models/Asset';

export const assetsRepository = {
  getAssets: async (page: number = 1, limit: number = 20): Promise<AssetResponse> => {
    const response = await apiClient.get<AssetResponse>('/assets', {
      params: { page, limit },
    });
    return response.data;
  },

  getAssetById: async (id: number): Promise<{ success: boolean; data: ItAsset }> => {
    const response = await apiClient.get<{ success: boolean; data: ItAsset }>(`/assets/${id}`);
    return response.data;
  },

  createAsset: async (data: CreateAssetDto): Promise<{ success: boolean; data: ItAsset }> => {
    const response = await apiClient.post<{ success: boolean; data: ItAsset }>('/assets', data);
    return response.data;
  },

  updateAsset: async (id: number, data: UpdateAssetDto): Promise<{ success: boolean; data: ItAsset }> => {
    const response = await apiClient.patch<{ success: boolean; data: ItAsset }>(`/assets/${id}`, data);
    return response.data;
  },

  createHandover: async (data: CreateHandoverDto): Promise<{ success: boolean; data: AssetHandover }> => {
    const response = await apiClient.post<{ success: boolean; data: AssetHandover }>('/assets/handovers', data);
    return response.data;
  },

  returnAsset: async (handoverId: number): Promise<{ success: boolean }> => {
    const response = await apiClient.patch<{ success: boolean }>(`/assets/handovers/${handoverId}/return`);
    return response.data;
  },
};
