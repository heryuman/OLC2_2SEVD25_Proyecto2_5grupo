export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:5000";

export const apiUrl = (path: string): string => {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${p}`;
};
