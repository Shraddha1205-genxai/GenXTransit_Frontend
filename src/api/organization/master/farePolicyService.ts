import { apiClient } from "../../apiClient";
import { FarePolicy } from "../../../features/organization/masters/FarePolicies";

const PATH = "/farepolicy";

export interface CreateFarePolicyDto {
  model: string;
  policyStatus: string;
  categoryId: string;
  routeId: string;
  baseFare: string;
  rateDescription: string;
}

export interface UpdateFarePolicyDto {
  policyId: string;
  model: string;
  policyStatus: string;
  categoryId: string;
  routeId: string;
  baseFare: string;
  rateDescription: string;
}

export interface DeleteFarePolicyDto {
  policyId: string;
}

export const farePolicyService = {
  getAll: async (
    searchText?: string,
    model?: string,
    policyStatus?: string,
    categoryId?: number,
    routeId?: number,
    isActive?: boolean,
    pageNumber?: number,
    pageSize?: number
  ): Promise<FarePolicy[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (model) params.append("model", model);
    if (policyStatus) params.append("policyStatus", policyStatus);
    if (categoryId !== undefined) params.append("categoryId", String(categoryId));
    if (routeId !== undefined) params.append("routeId", String(routeId));
    if (isActive !== undefined) params.append("isActive", String(isActive));
    if (pageNumber !== undefined) params.append("pageNumber", String(pageNumber));
    if (pageSize !== undefined) params.append("pageSize", String(pageSize));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<FarePolicy[]>(path);
    return response.data;
  },

  insert: async (dto: CreateFarePolicyDto): Promise<any> => {
    return apiClient.post(`${PATH}/insert`, dto);
  },

  update: async (dto: UpdateFarePolicyDto): Promise<any> => {
    return apiClient.post(`${PATH}/update`, dto);
  },

  delete: async (dto: DeleteFarePolicyDto): Promise<any> => {
    return apiClient.post(`${PATH}/delete`, dto);
  },
};
