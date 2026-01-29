import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS のクラス名をマージするユーティリティ
 * clsx と tailwind-merge を組み合わせて、重複するクラスを適切に処理
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 金額をフォーマット（¥1,000 形式）
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(amount);
}

/**
 * 日付をフォーマット（2026年1月28日 形式）
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * 相対時間をフォーマット（3日前 形式）
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "たった今";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}時間前`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}日前`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)}ヶ月前`;
  return `${Math.floor(diffInSeconds / 31536000)}年前`;
}
