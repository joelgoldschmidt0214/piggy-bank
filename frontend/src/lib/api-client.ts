/**
 * API Client - Backend API との通信を管理
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string;
}

/**
 * カスタムfetchラッパー
 * 認証トークンの自動付与、エラーハンドリングを実装
 */
async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "An error occurred",
    }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * API エンドポイント
 */
export const api = {
  // Transactions
  transactions: {
    list: (token?: string) =>
      fetchAPI<any[]>("/api/v1/transactions/", { token }),
    create: (data: any, token?: string) =>
      fetchAPI<any>("/api/v1/transactions/", {
        method: "POST",
        body: JSON.stringify(data),
        token,
      }),
    get: (id: number, token?: string) =>
      fetchAPI<any>(`/api/v1/transactions/${id}`, { token }),
    update: (id: number, data: any, token?: string) =>
      fetchAPI<any>(`/api/v1/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        token,
      }),
    delete: (id: number, token?: string) =>
      fetchAPI<void>(`/api/v1/transactions/${id}`, {
        method: "DELETE",
        token,
      }),
  },

  // AI Analysis
  analysis: {
    get: (token?: string) => fetchAPI<any>("/api/v1/analysis/", { token }),
  },

  // User
  users: {
    me: (token?: string) => fetchAPI<any>("/api/v1/users/me", { token }),
  },
};
