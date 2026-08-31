import { apiClient } from "../../apiClient";
import { Workshop } from "../../../features/organization/organizationManagement/Workshops";

const PATH = "/workshop";

export interface CreateWorkshopDto {
  workShopName: string;
  regionId: string;
  divisionId: string;
  depotId: string;
  workBays: number;
  activeRepairJobs: number;
  isActive: boolean;
}

export interface UpdateWorkshopDto {
  workShopId: string;
  workShopName: string;
  regionId: string;
  divisionId: string;
  depotId: string;
  workBays: number;
  activeRepairJobs: number;
  isActive: boolean;
}

export interface DeleteWorkshopDto {
  workShopId: string;
}

export const workshopService = {
  getAll: async (
    searchText?: string,
    regionId?: string,
    divisionId?: string,
    depotId?: string,
    isActive?: boolean
  ): Promise<Workshop[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (regionId) params.append("regionId", regionId);
    if (divisionId) params.append("divisionId", divisionId);
    if (depotId) params.append("depotId", depotId);
    if (isActive !== undefined) params.append("isActive", String(isActive));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<Workshop[]>(path);
    return response.data;
  },

  insert: async (dto: CreateWorkshopDto): Promise<any> => {
    return apiClient.post(`${PATH}/insert`, dto);
  },

  update: async (dto: UpdateWorkshopDto): Promise<any> => {
    return apiClient.post(`${PATH}/update`, dto);
  },

  delete: async (dto: DeleteWorkshopDto): Promise<any> => {
    return apiClient.post(`${PATH}/delete`, dto);
  },
};
