import { apiFetch } from "@/shared/api/client";

export function registerUser(payload) {
  return apiFetch("users/", { method: "POST", body: payload });
}
