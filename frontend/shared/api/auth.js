import { apiFetch } from "@/shared/api/client";
import { clearTokens, setTokens } from "@/shared/api/tokens";

export function registerUser(payload) {
  return apiFetch("users/", { method: "POST", body: payload, auth: false });
}

export async function loginUser({ email, password }) {
  const tokens = await apiFetch("jwt/create/", { method: "POST", body: { email, password }, auth: false });
  setTokens(tokens);
  return tokens;
}

export function logoutUser() {
  clearTokens();
}

export function requestPasswordReset({ email }) {
  return apiFetch("users/reset_password/", { method: "POST", body: { email }, auth: false });
}
