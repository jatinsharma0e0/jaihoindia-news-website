import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getNewsImageUrl(url: string | undefined | null): string {
  if (!url) return '/placeholder.svg';

  // If it's a full URL (http/https), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a relative path starting with /uploads, prepend backend URL
  // We assume backend is on port 5000 for local dev if not specified
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const BASE_URL = API_URL.replace('/api', ''); // remove /api suffix

  if (url.startsWith('/uploads')) {
    return `${BASE_URL}${url}`;
  }

  return url;
}
