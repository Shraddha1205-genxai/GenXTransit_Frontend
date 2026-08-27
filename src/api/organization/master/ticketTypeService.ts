import { apiClient } from "../../apiClient";
import { TicketType } from "../../../features/organization/masters/TicketTypes";

const PATH = "/tickettype";

export interface CreateTicketTypeDto {
  ticketName: string;
  description: string;
}

export interface UpdateTicketTypeDto {
  ticketId: string;
  ticketName: string;
  description: string;
}

export interface DeleteTicketTypeDto {
  ticketId: string;
}

export const ticketTypeService = {
  getAll: async (
    searchText?: string,
    isActive?: boolean,
    pageNumber?: number,
    pageSize?: number
  ): Promise<TicketType[]> => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (isActive !== undefined) params.append("isActive", String(isActive));
    if (pageNumber !== undefined) params.append("pageNumber", String(pageNumber));
    if (pageSize !== undefined) params.append("pageSize", String(pageSize));

    const queryString = params.toString();
    const path = `${PATH}${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<TicketType[]>(path);
    return response.data;
  },

  insert: async (dto: CreateTicketTypeDto): Promise<number> => {
    const response = await apiClient.post<number>(`${PATH}/insert`, dto);
    return response.data;
  },

  update: async (dto: UpdateTicketTypeDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/update`, dto);
    return response.data;
  },

  delete: async (dto: DeleteTicketTypeDto): Promise<boolean> => {
    const response = await apiClient.post<boolean>(`${PATH}/delete`, dto);
    return response.data;
  },
};
