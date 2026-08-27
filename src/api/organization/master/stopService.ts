import { apiClient } from "../../apiClient";
import { Stop } from "../../../features/organization/masters/Stop";

const PATH = "/stop";

export interface CreateStopDto {
  stopName: string;
  routeId: string;
  stopOrder: number;
}

export interface UpdateStopDto {
  stopId: string;
  stopName: string;
  routeId: string;
  stopOrder: number;
  isActive: boolean;
}

export interface DeleteStopDto {
  stopId: string;
}

export const stopService = {
  getAll: async (
    searchText?: string,
    routeId?: number,
    isActive?: boolean,
    pageNumber?: number,
    pageSize?: number
  ): Promise<Stop[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (routeId !== undefined) params.append("routeId", String(routeId));
    if (isActive !== undefined) params.append("isActive", String(isActive));
    if (pageNumber !== undefined) params.append("pageNumber", String(pageNumber));
    if (pageSize !== undefined) params.append("pageSize", String(pageSize));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<Stop[]>(path);
    return response.data;
  },

  insert: async (dto: CreateStopDto): Promise<number> => {
    const response = await apiClient.post<number>(`${PATH}/insert`, dto);
    return response.data;
  },

  update: async (dto: UpdateStopDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/update`, dto);
    return response.data;
  },

  delete: async (dto: DeleteStopDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/delete`, dto);
    return response.data;
  },
};
