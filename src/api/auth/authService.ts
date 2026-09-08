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
  userId: number;
  userName: string;
  email: string;
  roleId: number;
  roleName: string;
  accessToken: string;
  refreshToken: string;
  permissions: Permission[];
  name?: string;
  role?: string;
  depot?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenData {
  userId: number;
  accessToken: string;
  refreshToken: string;
}

const SESSION_KEY = "genxtransit.auth.session";

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthSession> => {
    const response = await apiClient.post<any>("/auth/login", credentials);
    const resData = response.data;
    const user = resData?.data || resData || {};
    const permissions: Permission[] = Array.isArray(user.permissions)
      ? user.permissions
      : Array.isArray(resData?.permissions)
      ? resData.permissions
      : [];

    const session: AuthSession = {
      userId: user.userId ?? resData?.userId ?? 0,
      userName: user.userName || resData?.userName || credentials.userName,
      email: user.email || resData?.email || "",
      roleId: user.roleId ?? resData?.roleId ?? 0,
      roleName: user.roleName || resData?.roleName || "",
      accessToken: user.accessToken || resData?.accessToken || "",
      refreshToken: user.refreshToken || resData?.refreshToken || "",
      permissions,
      name: user.userName || user.email || resData?.userName || credentials.userName,
      role: user.roleName || resData?.roleName || `Role ${user.roleId || 0}`,
      depot: "All depots",
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    if (session.accessToken) localStorage.setItem("accessToken", session.accessToken);
    if (session.refreshToken) localStorage.setItem("refreshToken", session.refreshToken);
    if (session.userId) localStorage.setItem("userId", String(session.userId));
    if (session.userName) localStorage.setItem("userName", session.userName);
    if (session.email) localStorage.setItem("email", session.email);
    if (session.roleId) localStorage.setItem("roleId", String(session.roleId));
    if (session.roleName) localStorage.setItem("roleName", session.roleName);
    localStorage.setItem("permissions", JSON.stringify(permissions));

    return session;
  },

  refreshToken: async (token?: string): Promise<RefreshTokenData> => {
    const refreshTokenToUse = token || localStorage.getItem("refreshToken") || "";
    if (!refreshTokenToUse) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<RefreshTokenData>("/auth/refresh-token", {
      refreshToken: refreshTokenToUse,
    });

    const data = response.data;
    if (data && data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      if (data.userId !== undefined && data.userId !== null) {
        localStorage.setItem("userId", String(data.userId));
      }

      try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
          const session = JSON.parse(stored);
          session.accessToken = data.accessToken;
          if (data.refreshToken) session.refreshToken = data.refreshToken;
          if (data.userId) session.userId = data.userId;
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        }
      } catch {}
    }

    return data;
  },

  getStoredSession: (): AuthSession | null => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        return JSON.parse(stored) as AuthSession;
      }
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const userName = localStorage.getItem("userName") || "";
        const email = localStorage.getItem("email") || "";
        const roleName = localStorage.getItem("roleName") || "";
        const roleId = Number(localStorage.getItem("roleId") || 0);
        const userId = Number(localStorage.getItem("userId") || 0);
        let permissions: Permission[] = [];
        try {
          permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
        } catch {}

        return {
          userId,
          userName,
          email,
          roleId,
          roleName,
          accessToken,
          refreshToken: localStorage.getItem("refreshToken") || "",
          permissions,
          name: userName || email || "User",
          role: roleName || `Role ${roleId}`,
          depot: "All depots",
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  clearSession: () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("email");
    localStorage.removeItem("roleId");
    localStorage.removeItem("roleName");
    localStorage.removeItem("permissions");
  },

  forgotPassword: async (email: string): Promise<string> => {
    const response = await apiClient.post<string>("/auth/forgot-password", { email });
    return response.data;
  },
  
  resetPassword: async (token: string, newPassword: string, confirmPassword: string): Promise<string> => {
    const response = await apiClient.post<string>("/auth/reset-password", { token, newPassword, confirmPassword });
    return response.data;
  },
 
  changePassword: async (oldPassword: string, newPassword: string, confirmPassword: string): Promise<string> => {
    const response = await apiClient.post<string>("/auth/change-password", { oldPassword, newPassword, confirmPassword });
    return response.data;
  },
};

export default authService;
