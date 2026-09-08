import { apiClient } from "../../apiClient";

export interface DocExpiryItem {
  docType: string;
  docExpiryDate: string;
}

export interface FleetVehicleRecord {
  fleetId: string;
  vehicleNumber: string;
  categoryId: string;
  categoryCode?: string;
  categoryName?: string;
  depotId: string;
  depotCode?: string;
  depotName?: string;
  seriesType: string;
  fleetStatus: string;
  docExpiry: DocExpiryItem[];
  isActive: boolean;
  createdBy?: number | null;
  createdDate?: string | null;
  modifiedBy?: number | null;
  modifiedDate?: string | null;
  totalCount?: number;
  serviceId?: string | null;
  serviceStatus?: string | null;
  serviceCount?: number | null;
}

export interface CreateFleetDto {
  vehicleNumber: string;
  categoryId: string;
  seriesType: string;
  depotId: string;
  docExpiry: DocExpiryItem[];
}

export interface UpdateFleetDto {
  fleetId: string;
  vehicleNumber: string;
  categoryId: string;
  seriesType: string;
  depotId: string;
  docExpiry: DocExpiryItem[];
}

export interface DeleteFleetDto {
  fleetId: string;
}

const PATH = "/fleet";

export const fleetService = {
  getAll: async (
    searchText?: string,
    categoryId?: string | number,
    depotId?: string | number,
    fleetStatus?: string,
    isActive?: boolean,
    pageNumber?: number,
    pageSize?: number
  ): Promise<FleetVehicleRecord[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (categoryId) params.append("categoryId", String(categoryId));
    if (depotId) params.append("depotId", String(depotId));
    if (fleetStatus) params.append("fleetStatus", fleetStatus);
    if (isActive !== undefined) params.append("isActive", String(isActive));
    if (pageNumber !== undefined) params.append("pageNumber", String(pageNumber));
    if (pageSize !== undefined) params.append("pageSize", String(pageSize));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    try {
      const response = await apiClient.get<any>(path);
      const data = response?.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch fleet vehicles:", err);
      return [];
    }
  },

  insert: async (dto: CreateFleetDto): Promise<any> => {
    return apiClient.post(`${PATH}/insert`, dto);
  },

  update: async (dto: UpdateFleetDto): Promise<any> => {
    return apiClient.post(`${PATH}/update`, dto);
  },

  delete: async (dto: DeleteFleetDto): Promise<any> => {
    return apiClient.post(`${PATH}/delete`, dto);
  },
};
