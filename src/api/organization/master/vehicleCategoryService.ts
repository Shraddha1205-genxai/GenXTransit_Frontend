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

  insert: async (dto: CreateVehicleCategoryDto): Promise<any> => {
    return apiClient.post(`${PATH}/insert`, dto);
  },

  update: async (dto: UpdateVehicleCategoryDto): Promise<any> => {
    return apiClient.post(`${PATH}/update`, dto);
  },

  delete: async (dto: DeleteVehicleCategoryDto): Promise<any> => {
    return apiClient.post(`${PATH}/delete`, dto);
  },
};
