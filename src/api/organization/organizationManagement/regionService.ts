import { apiClient } from "../../apiClient";
import { Region, RegionPayload } from "../../../features/organization/organizationManagement/Regions";

const PATH = "/region";

export const regionService = {
  getAll: async (searchText?: string, isActive?: boolean): Promise<Region[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (isActive !== undefined) params.append("isActive", String(isActive));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<Region[]>(path);
    return response.data;
  },

  insert: async (dto: Omit<RegionPayload, "regionId" | "regionCode">): Promise<number> => {
    const response = await apiClient.post<number>(`${PATH}/insert`, dto);
    return response.data;
  },

  update: async (dto: Omit<RegionPayload, "regionCode">): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/update`, dto);
    return response.data;
  },

  delete: async (dto: Pick<RegionPayload, "regionId">): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/delete`, dto);
    return response.data;
  },
};
