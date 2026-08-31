import { apiClient } from "../../apiClient";

const PATH = "/notificationtemplate";

export interface CreateNotificationTemplateDto {
  notificationTitle: string;
  channel: string;
  description: string;
}

export interface UpdateNotificationTemplateDto {
  notificationId: string;
  notificationTitle: string;
  channel: string;
  description: string;
}

export interface DeleteNotificationTemplateDto {
  notificationId: string;
}

export const notificationTemplateService = {
  getAll: async (
    searchText?: string,
    channel?: string,
    isActive?: boolean,
    pageNumber?: number,
    pageSize?: number
  ): Promise<any> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (channel) params.append("channel", channel);
    if (isActive !== undefined) params.append("isActive", String(isActive));
    if (pageNumber !== undefined) params.append("pageNumber", String(pageNumber));
    if (pageSize !== undefined) params.append("pageSize", String(pageSize));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<any[]>(path);
    return response.data;
  },

  insert: async (dto: CreateNotificationTemplateDto): Promise<any> => {
    return apiClient.post(`${PATH}/insert`, dto);
  },

  update: async (dto: UpdateNotificationTemplateDto): Promise<any> => {
    return apiClient.post(`${PATH}/update`, dto);
  },

  delete: async (dto: DeleteNotificationTemplateDto): Promise<any> => {
    return apiClient.post(`${PATH}/delete`, dto);
  },
};
