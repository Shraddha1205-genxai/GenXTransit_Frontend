import { apiClient } from "../../apiClient";
import { Depot, DepotPayload } from "../../../features/organization/organizationManagement/Depots";

const PATH = "/depot";

export interface CreateDepotDto {
  depotName: string;
  service: string;
  regionId: string;
  divisionId: string;
  zoneId: string;
  corpId: string;
  isActive: boolean;
}

export interface UpdateDepotDto {
  depotId: string;
  depotName: string;
  service: string;
  regionId: string;
  divisionId: string;
  zoneId: string;
  corpId: string;
  isActive: boolean;
}

export interface DeleteDepotDto {
  depotId: string;
}

export const depotService = {
  getAll: async (
    searchText?: string,
    corporationId?: string,
    regionId?: string,
    divisionId?: string,
    zoneId?: string,
    isActive?: boolean
  ): Promise<Depot[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (corporationId) params.append("corporationId", corporationId);
    if (regionId) params.append("regionId", regionId);
    if (divisionId) params.append("divisionId", divisionId);
    if (zoneId) params.append("zoneId", zoneId);
    if (isActive !== undefined) params.append("isActive", String(isActive));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<Depot[]>(path);
    return response.data;
  },

  insert: async (dto: CreateDepotDto): Promise<number> => {
    const response = await apiClient.post<number>(`${PATH}/insert`, dto);
    return response.data;
  },

  update: async (dto: UpdateDepotDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/update`, dto);
    return response.data;
  },

  delete: async (dto: DeleteDepotDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/delete`, dto);
    return response.data;
  },
};
