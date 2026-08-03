import { apiFetch } from "@/shared/api/client";

export async function getSchools() {
  const data = await apiFetch("school/");
  return data?.results ?? [];
}

export async function getClasses(schoolId) {
  if (!schoolId) return [];
  const data = await apiFetch(`class/?search=${encodeURIComponent(schoolId)}`);
  return data?.results ?? [];
}
