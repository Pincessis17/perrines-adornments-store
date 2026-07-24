import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extracts a human-readable message from an unknown caught error, including
 * Supabase/EmailJS errors which sometimes use `.text` instead of `.message`.
 */
export function getErrorMessage(error: unknown, fallback = "Unknown error occurred"): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    if (typeof err.message === "string") return err.message;
    if (typeof err.text === "string") return err.text;
  }
  return fallback;
}

