import { apiClient } from "../../apiClient";
import { VehicleCategory } from "../../../features/organization/masters/VehicleCategories";

const PATH = "/vehiclecategory";

export interface CreateVehicleCategoryDto {
  categoryName: string;
  capacity: string;
  type: string;
  class: string;
  isActive: boolean;
}

export interface UpdateVehicleCategoryDto {
  categoryId: string;
  categoryName: string;
  capacity: string;
  type: string;
  class: string;
  isActive: boolean;
}

export interface DeleteVehicleCategoryDto {
  categoryId: string;
}

export const vehicleCategoryService = {
  getAll: async (
    searchText?: string,
    type?: string,
    vehicleClass?: string,
    isActive?: boolean,
    pageNumber?: number,
    pageSize?: number
  ): Promise<VehicleCategory[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (type) params.append("type", type);
    if (vehicleClass) params.append("vehicleClass", vehicleClass);
    if (isActive !== undefined) params.append("isActive", String(isActive));
    if (pageNumber !== undefined) params.append("pageNumber", String(pageNumber));
    if (pageSize !== undefined) params.append("pageSize", String(pageSize));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<VehicleCategory[]>(path);
    return response.data;
  },

  insert: async (dto: CreateVehicleCategoryDto): Promise<number> => {
    const response = await apiClient.post<number>(`${PATH}/insert`, dto);
    return response.data;
  },

  update: async (dto: UpdateVehicleCategoryDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/update`, dto);
    return response.data;
  },

  delete: async (dto: DeleteVehicleCategoryDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/delete`, dto);
    return response.data;
  },
};
