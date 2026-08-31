import { apiClient } from "../../apiClient";
import { Stage } from "../../../features/organization/masters/Stages";

const PATH = "/stage";

export interface CreateStageDto {
  stageName: string;
  routeId: string;
  sectionFromId: string;
  sectionToId: string;
  distance: number;
}

export interface UpdateStageDto {
  stageId: string;
  stageName: string;
  routeId: string;
  sectionFromId: string;
  sectionToId: string;
  distance: number;
}

export interface DeleteStageDto {
  stageId: string;
}

export const stageService = {
  getAll: async (
    searchText?: string,
    routeId?: number,
    isActive?: boolean,
    pageNumber?: number,
    pageSize?: number
  ): Promise<Stage[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (routeId !== undefined) params.append("routeId", String(routeId));
    if (isActive !== undefined) params.append("isActive", String(isActive));
    if (pageNumber !== undefined) params.append("pageNumber", String(pageNumber));
    if (pageSize !== undefined) params.append("pageSize", String(pageSize));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<Stage[]>(path);
    return response.data;
  },

  insert: async (dto: CreateStageDto): Promise<any> => {
    return apiClient.post(`${PATH}/insert`, dto);
  },

  update: async (dto: UpdateStageDto): Promise<any> => {
    return apiClient.post(`${PATH}/update`, dto);
  },

  delete: async (dto: DeleteStageDto): Promise<any> => {
    return apiClient.post(`${PATH}/delete`, dto);
  },
};
