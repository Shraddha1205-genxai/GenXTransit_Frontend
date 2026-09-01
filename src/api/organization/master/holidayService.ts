import { apiClient } from "../../apiClient";

export interface Holiday {
  holidayId: string;
  holidayCode?: string;
  holidayName: string;
  occasion: string;
  date: string;
  description: string;
  type: string;
  isActive: boolean;
}

export interface CreateHolidayDto {
  holidayName: string;
  occasion: string;
  date: string;
  description: string;
  type: string;
}

export interface UpdateHolidayDto extends CreateHolidayDto {
  holidayId: string;
}

const PATH = "/holiday";

export const holidayService = {
  getAll: async (params?: { searchText?: string; type?: string; startDate?: string; endDate?: string; isActive?: boolean; pageNumber?: number; pageSize?: number }): Promise<Holiday[]> => {
    const query = new URLSearchParams();
    if (params?.searchText) query.append("searchText", params.searchText);
    if (params?.type) query.append("type", params.type);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.isActive !== undefined) query.append("isActive", String(params.isActive));
    if (params?.pageNumber) query.append("pageNumber", String(params.pageNumber));
    if (params?.pageSize) query.append("pageSize", String(params.pageSize));

    const qs = query.toString();
    const response = await apiClient.get<Holiday[]>(`${PATH}${qs ? `?${qs}` : ""}`);
    return response.data;
  },

  insert: async (dto: CreateHolidayDto): Promise<any> => {
    return apiClient.post<number>(`${PATH}/insert`, dto);
  },

  update: async (dto: UpdateHolidayDto): Promise<any> => {
    return apiClient.post<boolean>(`${PATH}/update`, dto);
  },

  delete: async (holidayId: string): Promise<any> => {
    return apiClient.post<boolean>(`${PATH}/delete`, { holidayId });
  },
};
