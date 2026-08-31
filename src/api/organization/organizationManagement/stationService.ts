import { apiClient } from "../../apiClient";
import { BusStation } from "../../../features/organization/organizationManagement/BusStation";

const PATH = "/station";

export interface CreateStationDto {
  stationName: string;
  regionId: string;
  divisionId: string;
  depotId: string;
  platforms: number;
  dailyFootfall: number;
  isActive: boolean;
}

export interface UpdateStationDto {
  stationId: string;
  stationName: string;
  regionId: string;
  divisionId: string;
  depotId: string;
  platforms: number;
  dailyFootfall: number;
  isActive: boolean;
}

export interface DeleteStationDto {
  stationId: string;
}

export const stationService = {
  getAll: async (
    searchText?: string,
    regionId?: string,
    divisionId?: string,
    depotId?: string,
    isActive?: boolean
  ): Promise<BusStation[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (regionId) params.append("regionId", regionId);
    if (divisionId) params.append("divisionId", divisionId);
    if (depotId) params.append("depotId", depotId);
    if (isActive !== undefined) params.append("isActive", String(isActive));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<BusStation[]>(path);
    return response.data;
  },

  insert: async (dto: CreateStationDto): Promise<any> => {
    return apiClient.post(`${PATH}/insert`, dto);
  },

  update: async (dto: UpdateStationDto): Promise<any> => {
    return apiClient.post(`${PATH}/update`, dto);
  },

  delete: async (dto: DeleteStationDto): Promise<any> => {
    return apiClient.post(`${PATH}/delete`, dto);
  },
};
