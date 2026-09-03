import { getAccessToken, clearTokens } from "@/shared/api/tokens";

const API_URL = "https://цифроваяшкола-вр.рф/api/v1/";

export class ApiError extends Error {
  constructor(status, data) {
    super(`Api request failed with status ${status}`);
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch(path, { method = "GET", body, headers, auth = true, ...rest } = {}) {
  const accessToken = auth ? getAccessToken() : null;

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
    if (response.status === 401 && accessToken) {
      clearTokens();
    }
    throw new ApiError(response.status, data);
  }

  return data;
}
