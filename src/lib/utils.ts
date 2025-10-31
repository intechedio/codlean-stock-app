import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { customAlphabet } from 'nanoid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// helpers
const alphaNum = '0123456789abcdefghijklmnopqrstuvwxyz';
const nano = customAlphabet(alphaNum, 12);
export function id(): string {
  return nano();
}

export function isoNow(): string {
  return new Date().toISOString();
}

export function fmtMoney(value: number, currency: string = 'TRY', locale: string = 'tr-TR'): string {
  if (!Number.isFinite(value)) return '₺0,00';
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
  } catch {
    return value.toFixed(2);
  }
}

export function byUpdatedDesc<T extends { updatedAt?: string; createdAt?: string }>(a: T, b: T): number {
  const ta = Date.parse(a.updatedAt || a.createdAt || '');
  const tb = Date.parse(b.updatedAt || b.createdAt || '');
  return tb - ta;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function groupBy<T, K extends string | number | symbol>(items: T[], getKey: (item: T) => K): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const k = getKey(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

