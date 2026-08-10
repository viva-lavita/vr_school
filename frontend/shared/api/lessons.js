import { apiFetch } from "@/shared/api/client";
import { subjects, lessons } from "@/shared/data/mockLessons";

const ITEMS_PER_PAGE = 4;

function normalizeLesson(lesson) {
  return {
    ...lesson,
    id: lesson.pk ?? lesson.id,
  };
}

function normalizeTestQuestion(q, type) {
  const pk = q.pk ?? q.id;
  // is_many_answers: true = checkbox, false = radio
  const isRadio = q.is_many_answers === false;
  const actualType = isRadio ? "radio" : type;

  return {
    ...q,
    id: `${type}_${pk}`,  // id по оригинальному типу чтобы не было конфликтов
    pk,
    type: actualType,
    apiType: type,  // оригинальный тип для API вызовов
    question: q.question || q.description,
    ...(q.description && !q.question ? { hint: q.description } : {}),
    ...(q.variants
      ? {
          options: q.variants.map((v) => v.answer),
          optionIds: q.variants.map((v) => v.pk ?? v.id),
        }
      : {}),
    ...(q.keys
      ? {
          labels: q.keys.map((k) => k.key),
          labelIds: q.keys.map((k) => k.pk ?? k.id),
          tags: (q.values || []).map((v) => v.value),
          tagIds: (q.values || []).map((v) => v.pk ?? v.id),
        }
      : {}),
  };
}

function normalizeTestDetail(detail) {
  const questions = [];

  if (detail.q_tests) {
    for (const q of detail.q_tests) {
      questions.push(normalizeTestQuestion(q, "text"));
    }
  }

  if (detail.checkbox_tests) {
    for (const q of detail.checkbox_tests) {
      questions.push(normalizeTestQuestion(q, "checkbox"));
    }
  }

  if (detail.key_value_tests) {
    for (const q of detail.key_value_tests) {
      questions.push(normalizeTestQuestion(q, "matching"));
    }
  }

  if (detail.essay_test) {
    const essays = Array.isArray(detail.essay_test) ? detail.essay_test : [detail.essay_test];
    for (const q of essays) {
      questions.push(normalizeTestQuestion(q, "essay"));
    }
  }

  return {
    ...detail,
    id: detail.pk ?? detail.id,
    questions,
  };
}

export async function getSubjects() {
  return subjects;
}

export async function getLessons({ subject, page = 1 } = {}) {
  try {
    const params = new URLSearchParams();
    if (subject) params.set("search", subject);
    params.set("page", page);
    const data = await apiFetch(`lessons/?${params}`);
    if (data.results?.length > 0) {
      return {
        results: data.results.map(normalizeLesson),
        count: data.count ?? 0,
        total_pages: Math.ceil((data.count ?? 0) / ITEMS_PER_PAGE),
      };
    }
  } catch {
    // fall through to mocks
  }

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

export async function getLesson(id) {
  try {
    const lesson = await apiFetch(`lessons/${id}/`);
    if (lesson?.pk) {
      const normalized = normalizeLesson(lesson);

      let tests = [];
      try {
        const testsList = await apiFetch(`tests/?lesson=${id}`);
        if (testsList.results?.length) {
          tests = testsList.results.map((t) => ({
            ...normalizeLesson(t),
            name: t.name,
            score: t.score ?? null,
            questions: [], // test_detail загружается отдельно
          }));
        }
      } catch {
        // no tests
      }

      return {
        ...normalized,
        test_comment: normalized.test_comment ?? normalized.description ?? "",
        tests,
      };
    }
  } catch {
    // fall through to mock
  }

  return lessons.find((l) => l.id === Number(id)) ?? null;
}

export async function getTestDetail(testId) {
  const detail = await apiFetch(`tests/${testId}/test_detail/`);
  return normalizeTestDetail(detail);
}

// --- Test answers ---

export async function getQuestionAnswer(questionId) {
  try {
    return await apiFetch(`test-answers/question/${questionId}/`);
  } catch {
    return [];
  }
}

export async function submitAnswer(questionId, answer) {
  return apiFetch(`test-answers/question/${questionId}/`, {
    method: "POST",
    body: { answer },
  });
}

export async function submitCheckboxAnswer(questionId, answerIds) {
  return apiFetch(`test-answers/checkbox/${questionId}/`, {
    method: "POST",
    body: { answers: answerIds },
  });
}

export async function getCheckboxAnswers(questionId) {
  try {
    return await apiFetch(`test-answers/checkbox/${questionId}/`);
  } catch {
    return [];
  }
}

export async function submitEssayAnswer(questionId, answer) {
  return apiFetch(`test-answers/essay/${questionId}/`, {
    method: "POST",
    body: { answer },
  });
}

export async function getEssayAnswers(questionId) {
  try {
    return await apiFetch(`test-answers/essay/${questionId}/`);
  } catch {
    return [];
  }
}

export async function submitKeyValueAnswer(questionId, answers) {
  return apiFetch(`test-answers/key-value/${questionId}/`, {
    method: "POST",
    body: { answers },
  });
}

export async function getKeyValueAnswers(questionId) {
  try {
    return await apiFetch(`test-answers/key-value/${questionId}/`);
  } catch {
    return [];
  }
}

// --- PATCH (обновление существующих ответов) ---

export async function updateAnswer(questionId, answer) {
  return apiFetch(`test-answers/question/${questionId}/update_answer/`, {
    method: "PATCH",
    body: { answer },
  });
}

export async function updateCheckboxAnswer(questionId, answerIds) {
  return apiFetch(`test-answers/checkbox/${questionId}/update_answer/`, {
    method: "PATCH",
    body: { answers: answerIds },
  });
}

export async function updateEssayAnswer(questionId, answer) {
  return apiFetch(`test-answers/essay/${questionId}/update_answer/`, {
    method: "PATCH",
    body: { answer },
  });
}

export async function updateKeyValueAnswer(questionId, answers) {
  return apiFetch(`test-answers/key-value/${questionId}/update_answer/`, {
    method: "PATCH",
    body: { answers },
  });
}
