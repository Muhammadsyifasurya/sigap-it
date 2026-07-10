import { useState, useCallback } from 'react';
import { assetsRepository } from '../data/repositories/assetsRepository';
import { ItAsset, CreateAssetDto, UpdateAssetDto, CreateHandoverDto } from '../domain/models/Asset';

export function useAssets() {
  const [assets, setAssets] = useState<ItAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async (page: number = 1, limit: number = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await assetsRepository.getAssets(page, limit);
      setAssets(res.data);
      setTotal(res.meta.total);
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setError(err?.response?.data?.message || 'Gagal memuat data aset.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAsset = useCallback(async (data: CreateAssetDto): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await assetsRepository.createAsset(data);
      await fetchAssets();
      return true;
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setError(err?.response?.data?.message || 'Gagal menambah aset.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchAssets]);

  const updateAsset = useCallback(async (id: number, data: UpdateAssetDto): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await assetsRepository.updateAsset(id, data);
      await fetchAssets();
      return true;
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setError(err?.response?.data?.message || 'Gagal update aset.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchAssets]);

  const createHandover = useCallback(async (data: CreateHandoverDto): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await assetsRepository.createHandover(data);
      await fetchAssets();
      return true;
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setError(err?.response?.data?.message || 'Gagal membuat E-BAST.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchAssets]);

  const returnAsset = useCallback(async (handoverId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await assetsRepository.returnAsset(handoverId);
      await fetchAssets();
      return true;
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setError(err?.response?.data?.message || 'Gagal mengembalikan aset.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchAssets]);

  return {
    assets,
    total,
    isLoading,
    error,
    fetchAssets,
    createAsset,
    updateAsset,
    createHandover,
    returnAsset,
  };
}
