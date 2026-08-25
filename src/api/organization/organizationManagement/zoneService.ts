import { apiClient } from "../../apiClient";
import { Zone } from "../../../features/organization/organizationManagement/Zones";

const PATH = "/zone";

export interface CreateZoneDto {
  zoneName: string;
  regionId: string;
  districts: string[];
  isActive: boolean;
}

export interface UpdateZoneDto {
  zoneId: string;
  zoneName: string;
  regionId: string;
  districts: string[];
  isActive: boolean;
}

export interface DeleteZoneDto {
  zoneId: string;
}

export const zoneService = {
  getAll: async (searchText?: string, regionId?: string, isActive?: boolean): Promise<Zone[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (regionId) params.append("regionId", regionId);
    if (isActive !== undefined) params.append("isActive", String(isActive));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<Zone[]>(path);
    return response.data;
  },

  insert: async (dto: CreateZoneDto): Promise<number> => {
    const response = await apiClient.post<number>(`${PATH}/insert`, dto);
    return response.data;
  },

  update: async (dto: UpdateZoneDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/update`, dto);
    return response.data;
  },

  delete: async (dto: DeleteZoneDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/delete`, dto);
    return response.data;
  },
};
