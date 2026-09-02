import { apiClient } from "../../apiClient";

export interface MenuRecordApi {
  id: number;
  iconName: string;
  sectionId: number;
  sortOrder: number;
  menuName: string;
  isActive: boolean;
  createdBy?: number | null;
  createdDate?: string | null;
  modifiedBy?: number | null;
  modifiedDate?: string | null;
}

export interface MenuInsertPayload {
  iconName: string;
  sectionId: number;
  sortOrder: number;
  menuName: string;
  isActive: boolean;
}

export interface MenuUpdatePayload extends MenuInsertPayload {
  id: number;
}

export interface MenuDeletePayload {
  id: number;
}

const PATH = "/menu";

export const menuService = {
  getAll: async (): Promise<MenuRecordApi[]> => {
    const response = await apiClient.get<MenuRecordApi[]>(PATH);
    const payload = response.data;

    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === "object" && "id" in payload) {
      return [payload as MenuRecordApi];
    }

    return [];
  },

  getById: async (id: number): Promise<MenuRecordApi> => {
    const response = await apiClient.get<MenuRecordApi>(`${PATH}/${id}`);
    return response.data;
  },

  insert: async (payload: MenuInsertPayload): Promise<number> => {
    const response = await apiClient.post<number>(`${PATH}/insert`, payload);
    return response.data;
  },

  update: async (payload: MenuUpdatePayload): Promise<number> => {
    const response = await apiClient.post<number>(`${PATH}/update`, payload);
    return response.data;
  },

  delete: async (payload: MenuDeletePayload): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/delete`, payload);
    return response.data;
  },
};
