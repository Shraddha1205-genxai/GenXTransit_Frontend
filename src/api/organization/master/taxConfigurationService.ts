import { apiClient } from "../../apiClient";

const PATH = "/taxconfiguration";

export interface CreateTaxConfigurationDto {
  taxType: string;
  description: string;
  rate: number;
}

export interface UpdateTaxConfigurationDto {
  taxId: string;
  taxType: string;
  description: string;
  rate: number;
}

export interface DeleteTaxConfigurationDto {
  taxId: string;
}

export const taxConfigurationService = {
  getAll: async (
    searchText?: string,
    taxType?: string,
    rateFrom?: number,
    rateTo?: number,
    isActive?: boolean,
    pageNumber?: number,
    pageSize?: number
  ): Promise<any> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (taxType) params.append("taxType", taxType);
    if (rateFrom !== undefined) params.append("rateFrom", String(rateFrom));
    if (rateTo !== undefined) params.append("rateTo", String(rateTo));
    if (isActive !== undefined) params.append("isActive", String(isActive));
    if (pageNumber !== undefined) params.append("pageNumber", String(pageNumber));
    if (pageSize !== undefined) params.append("pageSize", String(pageSize));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<any[]>(path);
    return response.data;
  },

  insert: async (dto: CreateTaxConfigurationDto): Promise<any> => {
    return apiClient.post(`${PATH}/insert`, dto);
  },

  update: async (dto: UpdateTaxConfigurationDto): Promise<any> => {
    return apiClient.post(`${PATH}/update`, dto);
  },

  delete: async (dto: DeleteTaxConfigurationDto): Promise<any> => {
    return apiClient.post(`${PATH}/delete`, dto);
  },
};
