import { apiClient } from "../../apiClient";
import { Corporation } from "../../../features/organization/organizationManagement/Corporations";

const PATH = "/corporation";

export interface CreateCorporationDto {
  corporationName: string;
  stateName: string;
  districtName: string;
  cityName: string;
  isActive: boolean;
}

export interface UpdateCorporationDto {
  corporationId: string;
  corporationName: string;
  stateName: string;
  districtName: string;
  cityName: string;
  isActive: boolean;
}

export interface DeleteCorporationDto {
  corporationId: string;
}

export const corporationService = {
  getAll: async (searchText?: string, stateName?: string, isActive?: boolean): Promise<Corporation[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (stateName) params.append("stateName", stateName);
    if (isActive !== undefined) params.append("isActive", String(isActive));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<Corporation[]>(path);
    return response.data;
  },

  insert: async (dto: CreateCorporationDto): Promise<number> => {
    const response = await apiClient.post<number>(`${PATH}/insert`, dto);
    return response.data;
  },

  update: async (dto: UpdateCorporationDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/update`, dto);
    return response.data;
  },

  delete: async (dto: DeleteCorporationDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/delete`, dto);
    return response.data;
  },
};
