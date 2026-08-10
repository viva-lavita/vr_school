import { getAccessToken } from "@/shared/api/tokens";

// Базовый URL API (захардкожен, чтобы не зависеть от переменных окружения)
const API_URL = "https://цифроваяшкола-вр.рф/api/v1/";
// Старый IP, который может быть зашит в некоторых вызовах
const OLD_API_BASE = "http://212.8.229.10/api/v1/";

export class ApiError extends Error {
  constructor(status, data) {
    super(`Api request failed with status ${status}`);
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch(path, { method = "GET", body, headers, ...rest } = {}) {
  // 🔥 Нормализация path: если это полный URL со старым IP – заменяем на правильный
  if (typeof path === 'string' && path.startsWith(OLD_API_BASE)) {
    path = path.replace(OLD_API_BASE, API_URL);
  }
  // Дополнительная защита на случай, если IP встречается в середине строки
  if (typeof path === 'string' && path.includes('212.8.229.10')) {
    path = path.replace(/http:\/\/212\.8\.229\.10\/api\/v1\//g, API_URL);
  }

  const accessToken = getAccessToken();

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data;
}