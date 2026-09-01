import { apiClient } from "../../apiClient";

export interface User {
  userId: number;
  userName: string;
  email: string;
  mobileNo: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  roleId: number | string;
  roleName?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  isFirstLogin: boolean;
  passwordChangedDate: string | null;
  createdDate: string;
  createdBy: number | null;
  modifiedDate: string | null;
  modifiedBy: number | null;
}

export interface AddUserPayload {
  userName: string;
  email: string;
  mobileNo: string;
  firstName: string;
  lastName: string;
  roleId: string;
}

export interface UpdateUserPayload {
  userId: number;
  userName: string;
  email: string;
  mobileNo: string;
  firstName: string;
  lastName: string;
  roleId: string;
}

export interface DeleteUserPayload {
  userId: number;
}

export interface GetAllUsersParams {
  searchText?: string;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetAllUsersResponse {
  items?: User[];
  totalRecords?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  data?: User | User[] | { items?: User[] };
}

export interface AddUserResponse {
  userId: number;
  userName: string;
  email: string;
  message: string;
}

export interface UpdateUserResponse {
  userId: number;
  userName: string;
  email: string;
  mobileNo: string;
  firstName: string;
  lastName: string;
  message: string;
}

const PATH = "/users";

const normalizeUser = (user: Partial<User>): User => ({
  ...user,
  userId: Number(user.userId ?? 0),
  roleId: Number(user.roleId ?? 0),
  userName: user.userName ?? "",
  email: user.email ?? "",
  mobileNo: user.mobileNo ?? "",
  passwordHash: user.passwordHash ?? "",
  firstName: user.firstName ?? "",
  lastName: user.lastName ?? "",
  isActive: Boolean(user.isActive),
  isEmailVerified: Boolean(user.isEmailVerified),
  isMobileVerified: Boolean(user.isMobileVerified),
  isFirstLogin: Boolean(user.isFirstLogin),
  passwordChangedDate: user.passwordChangedDate ?? null,
  createdDate: user.createdDate ?? new Date().toISOString(),
  createdBy: user.createdBy ?? null,
  modifiedDate: user.modifiedDate ?? null,
  modifiedBy: user.modifiedBy ?? null,
});

export const userService = {
  getAll: async (_params: GetAllUsersParams = {}): Promise<User[]> => {
    const response = await apiClient.get<GetAllUsersResponse>(PATH);

    const payload = response.data;
    if (Array.isArray(payload)) return payload.map(normalizeUser);
    if (payload && Array.isArray((payload as { items?: User[] }).items)) {
      return ((payload as { items?: User[] }).items ?? []).map(normalizeUser);
    }
    if (payload && typeof payload === "object" && "userId" in payload) {
      return [normalizeUser(payload as User)];
    }

    return [];
  },

  getById: async (userId: number): Promise<User> => {
    const response = await apiClient.get<User>(`${PATH}/${userId}`);
    return response.data;
  },

  add: async (payload: AddUserPayload): Promise<AddUserResponse> => {
    const response = await apiClient.post<AddUserResponse>(
      `${PATH}/insert`,
      payload,
    );
    return response.data;
  },

  update: async (payload: UpdateUserPayload): Promise<UpdateUserResponse> => {
    const response = await apiClient.post<UpdateUserResponse>(
      `${PATH}/update`,
      payload,
    );
    return response.data;
  },

  delete: async (payload: DeleteUserPayload): Promise<string> => {
    const response = await apiClient.post<{ data: string }>(
      `${PATH}/delete`,
      payload,
    );
    return response.data.data;
  },
};
