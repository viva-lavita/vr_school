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

export function confirmPasswordReset({ uid, token, new_password, re_new_password }) {
  return apiFetch("users/reset_password_confirm/", {
    method: "POST",
    body: { uid, token, new_password, re_new_password },
    auth: false,
  });
}

export function requestProfilePasswordChange({ email }) {
  return apiFetch("users/profile_password_change/", { method: "POST", body: { email } });
}

export function confirmProfilePasswordChange({ uid, token, current_password, new_password, re_new_password }) {
  return apiFetch("users/profile_password_change_confirm/", {
    method: "POST",
    body: { uid, token, current_password, new_password, re_new_password },
  });
}
