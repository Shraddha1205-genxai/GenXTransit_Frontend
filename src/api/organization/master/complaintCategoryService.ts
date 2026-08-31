import { apiClient } from "../../apiClient";

const PATH = "/complaintcategory";

export interface CreateComplaintCategoryDto {
  complaintTitle: string;
  description: string;
  complaintCategory: string;
  sla: string;
}

export interface UpdateComplaintCategoryDto {
  complaintId: string;
  complaintTitle: string;
  description: string;
  complaintCategory: string;
  sla: string;
}

export interface DeleteComplaintCategoryDto {
  complaintId: string;
}

export const complaintCategoryService = {
  getAll: async (
    searchText?: string,
    complaintCategory?: string,
    sla?: string,
    isActive?: boolean,
    pageNumber?: number,
    pageSize?: number
  ): Promise<any> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (complaintCategory) params.append("complaintCategory", complaintCategory);
    if (sla) params.append("sla", sla);
    if (isActive !== undefined) params.append("isActive", String(isActive));
    if (pageNumber !== undefined) params.append("pageNumber", String(pageNumber));
    if (pageSize !== undefined) params.append("pageSize", String(pageSize));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<any[]>(path);
    return response.data;
  },

  insert: async (dto: CreateComplaintCategoryDto): Promise<any> => {
    return apiClient.post(`${PATH}/insert`, dto);
  },

  update: async (dto: UpdateComplaintCategoryDto): Promise<any> => {
    return apiClient.post(`${PATH}/update`, dto);
  },

  delete: async (dto: DeleteComplaintCategoryDto): Promise<any> => {
    return apiClient.post(`${PATH}/delete`, dto);
  },
};
