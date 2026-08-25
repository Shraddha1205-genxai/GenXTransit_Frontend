import { apiRequest, type ApiResponse } from "./client";

export interface RegionRecord {
  regionId: string;
  regionCode: string;
  regionName: string;
  isActive: boolean;
  divisions?: number;
  depots?: number;
  stations?: number;
  workshops?: number;
  createdBy?: number | null;
  createdDate?: string | null;
  modifiedBy?: number | null;
  modifiedDate?: string | null;
  isDeleted?: boolean;
  deletedBy?: number | null;
  deletedDate?: string | null;
}

export type RegionPayload = {
  regionId: string;
  regionCode: string;
  regionName: string;
  isActive: boolean;
  divisions: number;
  depots: number;
  stations: number;
  workshops: number;
};

export type RegionCreatePayload = Pick<
  RegionPayload,
  "regionName" | "isActive"
>;
export type RegionUpdatePayload = Pick<
  RegionPayload,
  "regionId" | "regionName" | "isActive"
>;
export type RegionDeletePayload = Pick<RegionPayload, "regionId">;

const regionService = {
  getAll: async (): Promise<ApiResponse<RegionRecord[]>> =>
    apiRequest<ApiResponse<RegionRecord[]>>("/api/Region"),

  getById: async (id: string): Promise<ApiResponse<RegionRecord>> =>
    apiRequest<ApiResponse<RegionRecord>>(`/api/Region/${id}`),

  create: async (payload: RegionCreatePayload): Promise<ApiResponse<number>> =>
    apiRequest<ApiResponse<number>>("/api/Region/insert", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: async (payload: RegionUpdatePayload): Promise<ApiResponse<boolean>> =>
    apiRequest<ApiResponse<boolean>>("/Region/update", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  delete: async (payload: RegionDeletePayload): Promise<ApiResponse<boolean>> =>
    apiRequest<ApiResponse<boolean>>("/Region/delete", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export default regionService;
