// ==================================================
// IT Asset Management — Domain Models
// ==================================================

export interface AssetCurrentUser {
  name: string;
  department: {
    name: string;
  };
}

export interface ItAsset {
  id: number;
  assetTag: string;
  serialNumber: string;
  brand: string;
  model: string;
  type: string | null;        // Laptop, PC, Tablet, Smartphone, Monitor, dll
  hardwareTier: string | null; // Tier Developer, Tier Executive, Tier Admin
  purchaseDate: string | null;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED' | string;
  currentUserId: number | null;
  currentUser: AssetCurrentUser | null;
}

export interface AssetHandover {
  id: number;
  handoverNumber: string;
  assetId: number;
  userId: number;
  handoverDate: string;
  returnDate: string | null;
  status: 'ACTIVE' | 'RETURNED' | string;
  notes: string | null;
  evidenceFile: string | null;
  createdBy: number;
}

export interface AssetResponse {
  success: boolean;
  data: ItAsset[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateAssetDto {
  assetTag: string;
  serialNumber: string;
  brand: string;
  model: string;
  type?: string;
  hardwareTier?: string;
  purchaseDate?: string;
}

export interface UpdateAssetDto {
  brand?: string;
  model?: string;
  type?: string;
  hardwareTier?: string;
  status?: string;
  purchaseDate?: string;
}

export interface CreateHandoverDto {
  handoverNumber: string;
  assetId: number;
  userId: number;
  handoverDate: string;
  notes?: string;
}
