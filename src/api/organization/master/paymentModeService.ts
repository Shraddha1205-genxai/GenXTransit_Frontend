import { apiClient } from "../../apiClient";

const PATH = "/paymentmode";

export interface CreatePaymentModeDto {
  modeName: string;
  modeStatus: string;
  description: string;
}

export interface UpdatePaymentModeDto {
  modeId: string;
  modeName: string;
  modeStatus: string;
  description: string;
}

export interface DeletePaymentModeDto {
  modeId: string;
}

export const paymentModeService = {
  getAll: async (
    searchText?: string,
    modeStatus?: string,
    isActive?: boolean,
    pageNumber?: number,
    pageSize?: number
  ): Promise<any> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (modeStatus) params.append("modeStatus", modeStatus);
    if (isActive !== undefined) params.append("isActive", String(isActive));
    if (pageNumber !== undefined) params.append("pageNumber", String(pageNumber));
    if (pageSize !== undefined) params.append("pageSize", String(pageSize));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<any[]>(path);
    return response.data;
  },

  insert: async (dto: CreatePaymentModeDto): Promise<any> => {
    return apiClient.post(`${PATH}/insert`, dto);
  },

  update: async (dto: UpdatePaymentModeDto): Promise<any> => {
    return apiClient.post(`${PATH}/update`, dto);
  },

  delete: async (dto: DeletePaymentModeDto): Promise<any> => {
    return apiClient.post(`${PATH}/delete`, dto);
  },
};
