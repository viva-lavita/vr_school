import { apiFetch } from "@/shared/api/client";

export function getMe() {
  return apiFetch("users/me/");
}

export function updateMe(id, payload) {
  return apiFetch(`users/${id}/`, { method: "PATCH", body: payload });
}

export function updateChild(id, payload) {
  return apiFetch(`child/${id}/`, { method: "PATCH", body: payload });
}

export function deleteMe(id) {
  return apiFetch(`users/${id}/`, { method: "DELETE" });
}
