import { apiClient } from "../../apiClient";
import { ParkingYard } from "../../../features/organization/organizationManagement/ParkingYards";

const PATH = "/parkingyard";

export interface CreateParkingYardDto {
  yardName: string;
  regionId: string;
  divisionId: string;
  depotId: string;
  capacity: number;
  occupied: number;
  isActive?: boolean;
}

export interface UpdateParkingYardDto {
  yardId: string;
  yardName: string;
  regionId: string;
  divisionId: string;
  depotId: string;
  capacity: number;
  occupied: number;
  isActive?: boolean;
}

export interface DeleteParkingYardDto {
  yardId: string;
}

export const parkingYardService = {
  getAll: async (
    searchText?: string,
    regionId?: string,
    divisionId?: string,
    depotId?: string,
    isActive?: boolean
  ): Promise<ParkingYard[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (regionId) params.append("regionId", regionId);
    if (divisionId) params.append("divisionId", divisionId);
    if (depotId) params.append("depotId", depotId);
    if (isActive !== undefined) params.append("isActive", String(isActive));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<ParkingYard[]>(path);
    return response.data;
  },

  insert: async (dto: CreateParkingYardDto): Promise<number> => {
    const response = await apiClient.post<number>(`${PATH}/insert`, dto);
    return response.data;
  },

  update: async (dto: UpdateParkingYardDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/update`, dto);
    return response.data;
  },

  delete: async (dto: DeleteParkingYardDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/delete`, dto);
    return response.data;
  },
};
