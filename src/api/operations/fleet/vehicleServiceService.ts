import { apiClient } from "../../apiClient";

export interface serviceRecord {
  serviceId: string;
  serviceCode: string;
  fleetId: string;
  vehicleNumber: string;
  fleetStatus?: string;
  status: string; // Inprogress, Cancelled, Completed, Pending
  isActive: boolean;
  createdBy?: number | null;
  createdDate?: string | null;
  modifiedBy?: number | null;
  modifiedDate?: string | null;
  totalCount?: number;
}

export interface serviceRecordPayload {
  serviceId?: string;
  fleetId: string;
  status: string; // Inprogress, Cancelled, Completed, Pending
}

export type ServiceRecord = serviceRecord;
export type ServiceRecordPayload = serviceRecordPayload;

const PATH = "/service";

export const vehicleServiceService = {
  getAll: async (
    searchText?: string,
    fleetId?: string | number,
    status?: string,
    isActive?: boolean,
    pageNumber?: number,
    pageSize?: number
  ): Promise<serviceRecord[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (fleetId) params.append("fleetId", String(fleetId));
    if (status) params.append("status", status);
    if (isActive !== undefined) params.append("isActive", String(isActive));
    if (pageNumber !== undefined) params.append("pageNumber", String(pageNumber));
    if (pageSize !== undefined) params.append("pageSize", String(pageSize));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    try {
      const response = await apiClient.get<any>(path);
      const data = response?.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch vehicle service records:", err);
      return [];
    }
  },

  insert: async (dto: serviceRecordPayload): Promise<any> => {
    return apiClient.post(`${PATH}/insert`, dto);
  },

  update: async (dto: serviceRecordPayload): Promise<any> => {
    return apiClient.post(`${PATH}/update`, dto);
  },

  delete: async (dto: { serviceId: string }): Promise<any> => {
    return apiClient.post(`${PATH}/delete`, dto);
  },
};
