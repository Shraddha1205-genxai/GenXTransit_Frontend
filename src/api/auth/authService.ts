import { apiClient } from "../apiClient";

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface Permission {
  authId: number | null;
  roleId: number;
  sectionId: number;
  sectionName?: string | null;
  menuId: number;
  menuName?: string | null;
  tabId: number;
  tabName?: string | null;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAction?: boolean;
  isDefault: boolean;
}

export interface AuthUser {
  userId: number;
  userName: string;
  email: string;
  roleId: number;
  roleName: string;
  accessToken: string;
  refreshToken: string;
  permissions: Permission[];
}

export interface AuthSession {
  name: string;
  role: string;
  depot: string;
  userId: number;
  userName: string;
  email: string;
  roleId: number;
  accessToken: string;
  refreshToken: string;
  permissions: Permission[];
}

const SESSION_KEY = "genxtransit.auth.session";

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthSession> => {
    const response = await apiClient.post<AuthUser>("/auth/login", credentials);
    const user = response.data;
    const session: AuthSession = {
      name: user.userName || user.email || credentials.userName,
      role: user.roleName || `Role ${user.roleId}`,
      depot: "All depots",
      userId: user.userId,
      userName: user.userName,
      email: user.email,
      roleId: user.roleId,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  getStoredSession: (): AuthSession | null => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? (JSON.parse(stored) as AuthSession) : null;
    } catch {
      return null;
    }
  },

  clearSession: () => {
    sessionStorage.removeItem(SESSION_KEY);
  },

  forgotPassword: async (email: string): Promise<string> => {
    const response = await apiClient.post<string>("/auth/forgot-password", { email });
    return response.data;
  },
};

export default authService;
