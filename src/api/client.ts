const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5010"
).replace(/\/+$/, "");

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  totalCount?: number | null;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || (payload && payload.success === false)) {
    const message =
      payload?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export { API_BASE_URL };
