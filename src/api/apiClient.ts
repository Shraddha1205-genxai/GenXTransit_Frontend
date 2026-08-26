const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5189/api";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  totalCount: number | null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();
  if (!result.success) {
    throw new Error(result.message || "API request failed");
  }

  return result;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body: any, options?: RequestInit) => request<T>(path, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  }),
};
