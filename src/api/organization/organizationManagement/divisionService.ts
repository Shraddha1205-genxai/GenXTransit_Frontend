import { apiClient } from "../../apiClient";
import { Division } from "../../../features/organization/organizationManagement/Divisions";

const PATH = "/division";

export interface CreateDivisionDto {
  divisionName: string;
  regionId: string;
  isActive: boolean;
}

export interface UpdateDivisionDto {
  divisionId: string;
  divisionName: string;
  regionId: string;
  isActive: boolean;
}

export interface DeleteDivisionDto {
  divisionId: string;
}

export const divisionService = {
  getAll: async (searchText?: string, regionId?: string, isActive?: boolean): Promise<Division[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (regionId) params.append("regionId", regionId);
    if (isActive !== undefined) params.append("isActive", String(isActive));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<Division[]>(path);
    return response.data;
  },

  insert: async (dto: CreateDivisionDto): Promise<number> => {
    const response = await apiClient.post<number>(`${PATH}/insert`, dto);
    return response.data;
  },

  update: async (dto: UpdateDivisionDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/update`, dto);
    return response.data;
  },

  delete: async (dto: DeleteDivisionDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/delete`, dto);
    return response.data;
  },
};
