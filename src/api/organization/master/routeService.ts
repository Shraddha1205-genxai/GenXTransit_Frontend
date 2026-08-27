import { apiClient } from "../../apiClient";
import { Route } from "../../../features/organization/masters/Route";

const PATH = "/route";

export interface CreateRouteDto {
  routeName: string;
  service: string;
  fromStationId: string;
  toStationId: string;
  type: string;
  distance: number;
  fareModel: string;
  duration: string;
}

export interface UpdateRouteDto {
  routeId: string;
  routeName: string;
  service: string;
  fromStationId: string;
  toStationId: string;
  type: string;
  distance: number;
  fareModel: string;
  duration: string;
}

export interface DeleteRouteDto {
  routeId: string;
}

export const routeService = {
  getAll: async (
    searchText?: string,
    service?: string,
    type?: string,
    isActive?: boolean,
    pageNumber?: number,
    pageSize?: number
  ): Promise<Route[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (service) params.append("service", service);
    if (type) params.append("type", type);
    if (isActive !== undefined) params.append("isActive", String(isActive));
    if (pageNumber !== undefined) params.append("pageNumber", String(pageNumber));
    if (pageSize !== undefined) params.append("pageSize", String(pageSize));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<Route[]>(path);
    return response.data;
  },

  insert: async (dto: CreateRouteDto): Promise<number> => {
    const response = await apiClient.post<number>(`${PATH}/insert`, dto);
    return response.data;
  },

  update: async (dto: UpdateRouteDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/update`, dto);
    return response.data;
  },

  delete: async (dto: DeleteRouteDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/delete`, dto);
    return response.data;
  },
};
