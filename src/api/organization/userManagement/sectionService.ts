import { apiClient } from "../../apiClient";

export interface SectionRecordApi {
  sectionId: number;
  sectionName: string;
  isActive: boolean;
  createdBy?: number | null;
  createdDate?: string | null;
}

export interface SectionInsertPayload {
  sectionName: string;
  isActive: boolean;
}

export interface SectionUpdatePayload {
  sectionId: number;
  sectionName: string;
  isActive: boolean;
}

export interface SectionDeletePayload {
  sectionId: number;
}

const PATH = "/section";

export const sectionService = {
  getAll: async (): Promise<SectionRecordApi[]> => {
    const response = await apiClient.get<SectionRecordApi[]>(PATH);
    const payload = response.data;

    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === "object" && "sectionId" in payload) {
      return [payload as SectionRecordApi];
    }

    return [];
  },

  getById: async (sectionId: number): Promise<SectionRecordApi> => {
    const response = await apiClient.get<SectionRecordApi>(
      `${PATH}/${sectionId}`,
    );
    return response.data;
  },

  insert: async (payload: SectionInsertPayload): Promise<SectionRecordApi> => {
    const response = await apiClient.post<SectionRecordApi>(
      `${PATH}/insert`,
      payload,
    );
    return response.data;
  },

  update: async (payload: SectionUpdatePayload): Promise<SectionRecordApi> => {
    const response = await apiClient.post<SectionRecordApi>(
      `${PATH}/update`,
      payload,
    );
    return response.data;
  },

  delete: async (payload: SectionDeletePayload): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/delete`, payload);
    return response.data;
  },
};
