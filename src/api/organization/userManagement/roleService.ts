import { apiClient } from "../../apiClient";

export interface RoleRecord {
  roleId: number;
  roleName: string;
  description: string;
  isActive: boolean;
}

export interface CreateRoleDto {
  roleName: string;
  description: string;
}

export interface UpdateRoleDto {
  roleId: number;
  roleName: string;
  description: string;
  isActive: boolean;
}

export interface DeleteRoleDto {
  roleId: number;
}

export interface GetAllRolesResponse {
  items?: RoleRecord[];
  data?: RoleRecord[] | RoleRecord | { items?: RoleRecord[] };
}

const PATH = "/role";

const normalizeRole = (role: Partial<RoleRecord>): RoleRecord => ({
  roleId: Number(role.roleId ?? 0),
  roleName: role.roleName ?? "",
  description: role.description ?? "",
  isActive: Boolean(role.isActive),
});

export const roleService = {
  getAll: async (
    isActive?: boolean,
    searchText?: string,
  ): Promise<RoleRecord[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (isActive !== undefined) params.append("isActive", String(isActive));

    const path = `${PATH}${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiClient.get<GetAllRolesResponse>(path);
    const payload = response.data;

    if (Array.isArray(payload)) return payload.map(normalizeRole);
    if (payload && Array.isArray((payload as { items?: RoleRecord[] }).items)) {
      return ((payload as { items?: RoleRecord[] }).items ?? []).map(
        normalizeRole,
      );
    }
    if (payload && typeof payload === "object" && "roleId" in payload) {
      return [normalizeRole(payload as RoleRecord)];
    }

    return [];
  },

  insert: async (dto: CreateRoleDto): Promise<number> => {
    const response = await apiClient.post<number>(`${PATH}/insert`, dto);
    return response.data;
  },

  update: async (dto: UpdateRoleDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/update`, dto);
    return response.data;
  },

  delete: async (dto: DeleteRoleDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/delete`, dto);
    return response.data;
  },
};
