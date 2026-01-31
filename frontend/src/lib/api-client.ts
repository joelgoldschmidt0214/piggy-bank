/**
 * API Client - Backend API との通信を管理
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ========================================
// Type Definitions
// ========================================

/** Transaction base fields */
interface TransactionBase {
  item_name: string;
  amount: number;
  category: string | null;
  note: string | null;
}

/** Transaction creation payload */
export type TransactionCreate = TransactionBase;

/** Transaction update payload (all fields optional) */
export interface TransactionUpdate {
  item_name?: string;
  amount?: number;
  category?: string | null;
  note?: string | null;
}

/** Transaction response from API */
export interface Transaction extends TransactionBase {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

/** User response from API */
export interface User {
  id: number;
  auth_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/** AI advice data */
export interface AIAdvice {
  status: "safe" | "warning" | "danger";
  message: string;
  advice: string;
  action_items: string[];
}

/** Category spending summary */
export interface CategorySummary {
  category: string;
  amount: number;
}

/** Analysis response from API */
export interface AnalysisResponse {
  total_amount: number;
  transaction_count: number;
  top_categories: CategorySummary[];
  ai_advice: AIAdvice;
  error?: string;
}

// ========================================
// Fetch Wrapper
// ========================================

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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Merge existing headers
  if (fetchOptions.headers) {
    const existingHeaders = new Headers(fetchOptions.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

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
      fetchAPI<Transaction[]>("/api/v1/transactions/", { token }),
    create: (data: TransactionCreate, token?: string) =>
      fetchAPI<Transaction>("/api/v1/transactions/", {
        method: "POST",
        body: JSON.stringify(data),
        token,
      }),
    get: (id: number, token?: string) =>
      fetchAPI<Transaction>(`/api/v1/transactions/${id}`, { token }),
    update: (id: number, data: TransactionUpdate, token?: string) =>
      fetchAPI<Transaction>(`/api/v1/transactions/${id}`, {
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
    get: (token?: string) =>
      fetchAPI<AnalysisResponse>("/api/v1/analysis/", { token }),
  },

  // User
  users: {
    me: (token?: string) => fetchAPI<User>("/api/v1/users/me", { token }),
  },
};
