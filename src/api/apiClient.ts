const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5189/api";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  totalCount: number | null;
}

const AUTH_EXCLUDED_ENDPOINTS = [
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh-token",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/refresh-token",
];

async function request<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${path}`;

  const cleanPath = path.split("?")[0].toLowerCase();
  const isAuthExcluded = AUTH_EXCLUDED_ENDPOINTS.some((endpoint) =>
    cleanPath.endsWith(endpoint.toLowerCase())
  );

  let accessToken: string | null = null;
  if (!isAuthExcluded) {
    try {
      accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        const storedSession = localStorage.getItem("genxtransit.auth.session");
        accessToken = storedSession
          ? JSON.parse(storedSession).accessToken || null
          : null;
      }
    } catch {
      accessToken = null;
    }
  }

  const headers = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && !isAuthExcluded && !isRetry) {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (storedRefreshToken) {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });
        if (refreshResponse.ok) {
          const refreshResult = await refreshResponse.json();
          if (
            refreshResult &&
            refreshResult.success &&
            refreshResult.data?.accessToken
          ) {
            const newAccessToken = refreshResult.data.accessToken;
            const newRefreshToken = refreshResult.data.refreshToken;
            localStorage.setItem("accessToken", newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem("refreshToken", newRefreshToken);
            }
            if (refreshResult.data.userId !== undefined && refreshResult.data.userId !== null) {
              localStorage.setItem("userId", String(refreshResult.data.userId));
            }
            try {
              const storedSession = localStorage.getItem("genxtransit.auth.session");
              if (storedSession) {
                const session = JSON.parse(storedSession);
                session.accessToken = newAccessToken;
                if (newRefreshToken) session.refreshToken = newRefreshToken;
                localStorage.setItem("genxtransit.auth.session", JSON.stringify(session));
              }
            } catch {}

            return request<T>(path, options, true);
          }
        }
      }
    } catch (e) {
      // Token refresh failed
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Fallback to default message if response isn't valid JSON
    }
    throw new Error(errorMessage);
  }

  const result: ApiResponse<T> = await response.json();
  if (!result.success) {
    throw new Error(result.message || "API request failed");
  }

  return result;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body: any, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),
};
