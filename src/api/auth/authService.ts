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
    const response = await apiClient.post<AuthUser>("/auth/login", credentials);
    const user = response.data;
    const session: AuthSession = {
      userId: user.userId,
      userName: user.userName,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      name: user.userName || user.email || credentials.userName,
      role: user.roleName || `Role ${user.roleId}`,
      depot: "All depots",
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    if (user.accessToken) localStorage.setItem("accessToken", user.accessToken);
    if (user.refreshToken) localStorage.setItem("refreshToken", user.refreshToken);
    if (user.userId !== undefined && user.userId !== null) localStorage.setItem("userId", String(user.userId));
    if (user.userName) localStorage.setItem("userName", user.userName);
    if (user.email) localStorage.setItem("email", user.email);
    if (user.roleId !== undefined && user.roleId !== null) localStorage.setItem("roleId", String(user.roleId));
    if (user.roleName) localStorage.setItem("roleName", user.roleName);
    localStorage.setItem("permissions", JSON.stringify(Array.isArray(user.permissions) ? user.permissions : []));

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
