import { apiClient } from "../../apiClient";

export interface DriverConductorUser {
  userId: number;
  userName: string;
  firstName: string;
  lastName: string;
  roleId?: number;
  roleName?: string;
  depotId?: number | string;
}

export interface GetDriverConductorParams {
  roleId?: number | string;
  roleName?: string;
  depotId?: number | string;
}

const PATH = "/driverconductoravailability/driver-conductor";

export const driverConductorService = {
  getDriverConductor: async (
    params: GetDriverConductorParams = {}
  ): Promise<DriverConductorUser[]> => {
    const query = new URLSearchParams();
    if (params.roleId) query.append("roleId", String(params.roleId));
    if (params.roleName) query.append("roleName", params.roleName);
    if (params.depotId) query.append("depotId", String(params.depotId));

    const path = `${PATH}${query.toString() ? `?${query.toString()}` : ""}`;

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
      console.error("Failed to fetch driver conductor availability:", err);
      return [];
    }
  },
};
