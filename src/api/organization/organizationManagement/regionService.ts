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

  insert: async (dto: Omit<RegionPayload, "regionId" | "regionCode">): Promise<any> => {
    return apiClient.post(`${PATH}/insert`, dto);
  },

  update: async (dto: Omit<RegionPayload, "regionCode">): Promise<any> => {
    return apiClient.post(`${PATH}/update`, dto);
  },

  delete: async (dto: Pick<RegionPayload, "regionId">): Promise<any> => {
    return apiClient.post(`${PATH}/delete`, dto);
  },
};
