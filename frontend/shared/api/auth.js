import { apiFetch } from "@/shared/api/client";
import { clearTokens, setTokens } from "@/shared/api/tokens";

export function registerUser(payload) {
  return apiFetch("users/", { method: "POST", body: payload });
}

export async function loginUser({ email, password }) {
  const tokens = await apiFetch("jwt/create/", { method: "POST", body: { email, password } });
  setTokens(tokens);
  return tokens;
}

export function logoutUser() {
  clearTokens();
}
