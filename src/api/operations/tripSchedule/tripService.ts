import { apiClient } from "../../apiClient";

export interface TripRecord {
  tripId: string;
  tripCode: string;
  depotId: string;
  depotCode?: string;
  depotName?: string;
  routeId: string;
  routeCode?: string;
  routeName?: string;
  fleetId: string;
  vehicleNumber?: string;
  fleetStatus?: string;
  driverId: string;
  driverName?: string;
  conductorId: string;
  conductorName?: string;
  scheduleTime: string;
  actualTime?: string;
  tripStatus: string;
  isActive: boolean;
  createdBy?: number | null;
  createdDate?: string | null;
  modifiedBy?: number | null;
  modifiedDate?: string | null;
  totalCount?: number;
}

export interface CreateTripDto {
  routeId: string;
  depotId: string;
  fleetId: string;
  driverId: string;
  conductorId: string;
  scheduleTime: string;
  actualTime: string;
  tripStatus: string;
}

export interface UpdateTripDto {
  tripId: string;
  routeId: string;
  depotId: string;
  fleetId: string;
  driverId: string;
  conductorId: string;
  scheduleTime: string;
  actualTime: string;
  tripStatus: string;
}

export interface DeleteTripDto {
  tripId: string;
}

const PATH = "/trip";

export const tripService = {
  getAll: async (
    searchText?: string,
    depotId?: string | number,
    routeId?: string | number,
    fleetId?: string | number,
    tripStatus?: string,
    startDate?: string,
    endDate?: string,
    isActive?: boolean,
    pageNumber?: number,
    pageSize?: number
  ): Promise<TripRecord[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (depotId) params.append("depotId", String(depotId));
    if (routeId) params.append("routeId", String(routeId));
    if (fleetId) params.append("fleetId", String(fleetId));
    if (tripStatus) params.append("tripStatus", tripStatus);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
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
      console.error("Failed to fetch trip schedule records:", err);
      return [];
    }
  },

  insert: async (dto: CreateTripDto): Promise<any> => {
    return apiClient.post(`${PATH}/insert`, dto);
  },

  update: async (dto: UpdateTripDto): Promise<any> => {
    return apiClient.post(`${PATH}/update`, dto);
  },

  delete: async (dto: DeleteTripDto): Promise<any> => {
    return apiClient.post(`${PATH}/delete`, dto);
  },
};
