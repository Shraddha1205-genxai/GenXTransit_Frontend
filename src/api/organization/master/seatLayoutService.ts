import { apiClient } from "../../apiClient";

const PATH = "/seatlayout";

export interface CreateSeatLayoutDto {
  description: string;
  categoryId: string;
}

export interface UpdateSeatLayoutDto {
  layoutId: string;
  description: string;
  categoryId: string;
}

export interface DeleteSeatLayoutDto {
  layoutId: string;
}

export const seatLayoutService = {
  getAll: async (
    searchText?: string,
    categoryId?: number,
    isActive?: boolean,
    pageNumber?: number,
    pageSize?: number
  ): Promise<any> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (categoryId !== undefined) params.append("categoryId", String(categoryId));
    if (isActive !== undefined) params.append("isActive", String(isActive));
    if (pageNumber !== undefined) params.append("pageNumber", String(pageNumber));
    if (pageSize !== undefined) params.append("pageSize", String(pageSize));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<any[]>(path);
    return response.data;
  },

  insert: async (dto: CreateSeatLayoutDto): Promise<any> => {
    return apiClient.post(`${PATH}/insert`, dto);
  },

  update: async (dto: UpdateSeatLayoutDto): Promise<any> => {
    return apiClient.post(`${PATH}/update`, dto);
  },

  delete: async (dto: DeleteSeatLayoutDto): Promise<any> => {
    return apiClient.post(`${PATH}/delete`, dto);
  },
};
