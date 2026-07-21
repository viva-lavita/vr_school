import { apiFetch } from "@/shared/api/client";
import { subjects, lessons } from "@/shared/data/mockLessons";

const ITEMS_PER_PAGE = 4;

export async function getSubjects() {
  try {
    const data = await apiFetch("subject/");
    return data?.results ?? subjects;
  } catch {
    return subjects;
  }
}

export async function getLessons({ subject, page = 1 } = {}) {
  try {
    const params = new URLSearchParams();
    if (subject) params.set("subject", subject);
    params.set("page", page);
    const data = await apiFetch(`lessons/?${params}`);
    return data;
  } catch {
    let filtered = lessons;
    if (subject) {
      filtered = lessons.filter((l) => l.subject === Number(subject));
    }
    const total = filtered.length;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const results = filtered.slice(start, start + ITEMS_PER_PAGE);
    return { results, count: total, total_pages: totalPages };
  }
}

export async function getLesson(id) {
  try {
    return await apiFetch(`lessons/${id}/`);
  } catch {
    return lessons.find((l) => l.id === Number(id)) ?? null;
  }
}
