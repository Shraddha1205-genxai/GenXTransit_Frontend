import { apiClient } from "../../../apiClient";

export interface TabRecordApi {
  tabId: number;
  sectionId: number;
  menuId: number;
  tabName: string;
  sortOrder: number;
  url: string;
  isActive: boolean;
  createdBy?: number | null;
  createdDate?: string | null;
  modifiedBy?: number | null;
  modifiedDate?: string | null;
}

export interface TabInsertPayload {
  sectionId: number;
  menuId: number;
  tabName: string;
  sortOrder: number;
  url: string;
  isActive: boolean;
}

export interface TabUpdatePayload extends TabInsertPayload {
  tabId: number;
}

export interface TabDeletePayload {
  tabId: number;
}

const PATH = "/tab";

export const tabService = {
  getAll: async (menuId?: number, sectionId?: number, isActive?: boolean): Promise<TabRecordApi[]> => {
    const params = new URLSearchParams();
    if (menuId !== undefined && menuId !== null) params.append("menuId", String(menuId));
    if (sectionId !== undefined && sectionId !== null) params.append("sectionId", String(sectionId));
    if (isActive !== undefined) params.append("isActive", String(isActive));
    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<TabRecordApi[]>(path);
    const payload = response.data;

    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === "object" && "tabId" in payload) {
      return [payload as TabRecordApi];
    }

    return [];
  },

  getById: async (tabId: number): Promise<TabRecordApi> => {
    const response = await apiClient.get<TabRecordApi>(`${PATH}/${tabId}`);
    return response.data;
  },

  insert: async (payload: TabInsertPayload): Promise<number> => {
    const response = await apiClient.post<number>(`${PATH}/insert`, payload);
    return response.data;
  },

  update: async (payload: TabUpdatePayload): Promise<number> => {
    const response = await apiClient.post<number>(`${PATH}/update`, payload);
    return response.data;
  },

  delete: async (payload: TabDeletePayload): Promise<number> => {
    const response = await apiClient.post<number>(`${PATH}/delete`, payload);
    return response.data;
  },
};
