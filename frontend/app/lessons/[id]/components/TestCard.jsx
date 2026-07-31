"use client";

import { useState, useEffect } from "react";
import QuestionRadio from "./questions/QuestionRadio";
import QuestionCheckbox from "./questions/QuestionCheckbox";
import QuestionText from "./questions/QuestionText";
import QuestionMatching from "./questions/QuestionMatching";
import QuestionMatchingMulti from "./questions/QuestionMatchingMulti";
import QuestionEssay from "./questions/QuestionEssay";
import TestResults from "./TestResults";
import {
  submitAnswer, submitCheckboxAnswer, submitEssayAnswer, submitKeyValueAnswer,
  updateAnswer, updateCheckboxAnswer, updateEssayAnswer, updateKeyValueAnswer,
  getQuestionAnswer, getCheckboxAnswers, getEssayAnswers, getKeyValueAnswers,
} from "@/shared/api/lessons";

const STATUS_CONFIG = {
  new: { label: "новое", borderColor: "border-[#FFB62F]", textColor: "text-[#FFB62F]" },
  in_progress: { label: "в работе", borderColor: "border-[#DB0000]", textColor: "text-[#DB0000]" },
  review: { label: "на проверке", borderColor: "border-[#DB0000]", textColor: "text-[#DB0000]" },
  passed: { label: "пройдено", borderColor: "border-[#22C55E]", textColor: "text-[#22C55E]" },
  failed: { label: "не пройдено", borderColor: "border-[#DB0000]", textColor: "text-[#DB0000]" },
};

function getStorageKey(userId, testId) {
  return `test_progress_${userId}_${testId}`;
}

function loadTestProgress(userId, testId) {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(getStorageKey(userId, testId));
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveTestProgress(userId, testId, data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(userId, testId), JSON.stringify(data));
}

function clearTestProgress(userId, testId) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getStorageKey(userId, testId));
}

export default function TestCard({ test, user, onBackToMaterials }) {
  const [expanded, setExpanded] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [draggedTag, setDraggedTag] = useState(null);
  const [touched, setTouched] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [allSubmitted, setAllSubmitted] = useState(false);
  const [returnedWithProgress, setReturnedWithProgress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationMsg, setValidationMsg] = useState(null);

  const questions = test.questions || [];
  const total = questions.length;
  const question = questions[currentQuestion];
  const userId = user?.pk;
  const isLast = currentQuestion === total - 1;
  const hasEssay = questions.some((q) => q.type === "essay");
  const answeredCount = Object.keys(submittedAnswers).length;
  const isCurrentAnswered = submittedAnswers[question?.id] !== undefined;
  const isCurrentFromServer = submittedAnswers[question?.id]?.pk !== undefined;

  // Восстановление прогресса из localStorage
  useEffect(() => {
    if (!userId) return;
    const saved = loadTestProgress(userId, test.id);
    if (!saved) return;

    if (saved.allSubmitted && saved.submittedAnswers) {
      setAllSubmitted(true);
      setSubmittedAnswers(saved.submittedAnswers);
      setTouched(true);
    } else if (saved.answers && Object.keys(saved.answers).length > 0) {
      setAnswers(saved.answers);
      setCurrentQuestion(saved.currentQuestion || 0);
      if (saved.submittedAnswers) setSubmittedAnswers(saved.submittedAnswers);
      setTouched(true);
      setReturnedWithProgress(true);
    }
  }, [userId, test.id]);

  // Загрузка существующего ответа с сервера при открытии вопроса
  useEffect(() => {
    if (!question || submittedAnswers[question.id] !== undefined) return;
    let cancelled = false;

    async function fetchExisting() {
      try {
        let existing = null;
        const qid = question.id;

        if (question.type === "checkbox") {
          const data = await getCheckboxAnswers(qid);
          if (data?.length > 0) existing = data[0];
        } else if (question.type === "essay") {
          const data = await getEssayAnswers(qid);
          if (data?.length > 0) existing = data[0];
        } else if (question.type === "matching") {
          const data = await getKeyValueAnswers(qid);
          if (data?.length > 0) existing = data[0];
        } else {
          const data = await getQuestionAnswer(qid);
          if (data?.length > 0) existing = data[0];
        }

        if (cancelled || !existing) return;

        setSubmittedAnswers((prev) => ({ ...prev, [qid]: existing }));
        setTouched(true);

        // Восстанавливаем answers из серверного ответа
        if (question.type === "checkbox" && existing.answers) {
          // existing.answers = [variant_id, ...] → маппим в индексы
          const indices = existing.answers.map((vid) => {
            const idx = question.optionIds?.indexOf(vid);
            return idx !== -1 ? idx : vid;
          });
          setAnswers((prev) => ({ ...prev, [qid]: indices }));
        } else if (question.type === "matching" && existing.answers) {
          // existing.answers = [{key, values}] → маппим в объект {labelIndex: tagIndex}
          const mapped = {};
          for (const item of existing.answers) {
            const labelIdx = item.key - 1;
            const tagIndices = item.values.map((v) => v - 1);
            mapped[labelIdx] = tagIndices.length === 1 ? tagIndices[0] : tagIndices;
          }
          setAnswers((prev) => ({ ...prev, [qid]: mapped }));
        } else if (existing.answer !== undefined) {
          setAnswers((prev) => ({ ...prev, [qid]: existing.answer }));
        }
      } catch {
        // ответа нет — ок
      }
    }

    fetchExisting();
    return () => { cancelled = true; };
  }, [currentQuestion, question, submittedAnswers]);

  // Сохраняем прогресс при изменении ответов
  useEffect(() => {
    if (!userId || allSubmitted || returnedWithProgress) return;
    if (!touched && Object.keys(answers).length === 0) return;
    saveTestProgress(userId, test.id, {
      answers,
      currentQuestion,
      submittedAnswers,
      startedAt: Date.now(),
    });
  }, [userId, allSubmitted, returnedWithProgress, touched, answers, currentQuestion, submittedAnswers, test.id]);

  // Статус
  let displayStatus = "new";
  if (allSubmitted) {
    displayStatus = hasEssay ? "review" : test.status;
  } else if (touched) {
    displayStatus = "in_progress";
  }
  const status = STATUS_CONFIG[displayStatus] || STATUS_CONFIG.new;

  const validateQuestion = (q) => {
    const ans = answers[q.id];
    if (q.type === "radio") return ans !== undefined;
    if (q.type === "checkbox") return Array.isArray(ans) && ans.length > 0;
    if (q.type === "text") return typeof ans === "string" && ans.trim().length > 0;
    if (q.type === "matching") {
      if (!ans) return false;
      if (q.multi) return Object.values(ans).some((v) => Array.isArray(v) ? v.length > 0 : v !== undefined);
      return Object.values(ans).length > 0;
    }
    if (q.type === "essay") return typeof ans === "string" && ans.trim().length > 0;
    return true;
  };

  const formatAnswer = (q) => {
    const ans = answers[q.id];
    if (q.type === "radio") return q.options?.[ans] ?? ans;
    if (q.type === "checkbox") {
      if (!Array.isArray(ans)) return ans;
      return ans.map((i) => q.options?.[i] ?? i).join(", ");
    }
    if (q.type === "text") return ans;
    if (q.type === "essay") return ans;
    if (q.type === "matching") {
      if (q.multi) {
        return Object.entries(ans || {}).map(([k, v]) => {
          const label = q.labels?.[k] ?? k;
          const vals = (Array.isArray(v) ? v : [v]).map((x) => q.tags?.[x] ?? x);
          return `${label}: ${vals.join(", ")}`;
        }).join("; ");
      }
      return Object.entries(ans || {}).map(([k, v]) => {
        const label = q.labels?.[k] ?? k;
        return `${label}: ${q.tags?.[v] ?? v}`;
      }).join("; ");
    }
    return ans;
  };

  const handleAnswer = async () => {
    if (!validateQuestion(question)) {
      setErrors((prev) => ({ ...prev, [question.id]: true }));
      return;
    }
    setErrors((prev) => ({ ...prev, [question.id]: false }));
    setValidationMsg(null);
    setTouched(true);

    const answerValue = formatAnswer(question);
    const existingAnswer = submittedAnswers[question.id];
    const hasServerPk = existingAnswer?.pk !== undefined;
    setSubmitting(true);
    try {
      let res;
      const ans = answers[question.id];
      if (question.type === "checkbox") {
        const ids = Array.isArray(ans) ? ans.map((i) => question.optionIds?.[i] ?? i) : [];
        res = hasServerPk
          ? await updateCheckboxAnswer(question.id, ids)
          : await submitCheckboxAnswer(question.id, ids);
      } else if (question.type === "radio") {
        const optionId = question.optionIds?.[ans] ?? ans;
        res = hasServerPk
          ? await updateAnswer(question.id, String(optionId))
          : await submitAnswer(question.id, String(optionId));
      } else if (question.type === "essay") {
        res = hasServerPk
          ? await updateEssayAnswer(question.id, ans)
          : await submitEssayAnswer(question.id, ans);
      } else if (question.type === "matching") {
        const kvAnswers = Object.entries(ans || {}).map(([k, v]) => ({
          key: Number(k) + 1,
          values: Array.isArray(v) ? v.map((x) => Number(x) + 1) : [Number(v) + 1],
        }));
        res = hasServerPk
          ? await updateKeyValueAnswer(question.id, kvAnswers)
          : await submitKeyValueAnswer(question.id, kvAnswers);
      } else {
        res = hasServerPk
          ? await updateAnswer(question.id, answerValue)
          : await submitAnswer(question.id, answerValue);
      }
      setSubmittedAnswers((prev) => {
        const next = { ...prev, [question.id]: res };
        // Автопереход к следующему неотвеченному
        const nextUnanswered = questions.findIndex((q) => next[q.id] === undefined);
        if (nextUnanswered !== -1) setCurrentQuestion(nextUnanswered);
        return next;
      });
    } catch (err) {
      setSubmittedAnswers((prev) => ({ ...prev, [question.id]: { answer: answerValue } }));
    }
    setSubmitting(false);

    // Проверяем завершение в следующем рендере через useEffect-like логику
  };

  // Проверка завершения после обновления submittedAnswers
  useEffect(() => {
    if (!touched || allSubmitted) return;
    if (answeredCount === total && total > 0) {
      setAllSubmitted(true);
      if (userId) {
        clearTestProgress(userId, test.id);
        saveTestProgress(userId, test.id, {
          allSubmitted: true,
          submittedAnswers,
        });
      }
    }
  }, [answeredCount, total, touched, allSubmitted, userId, test.id, submittedAnswers]);

  const markTouched = () => {
    if (!touched) setTouched(true);
  };

  const handleContinue = () => {
    setReturnedWithProgress(false);
    // Переходим к первому неотвеченному вопросу
    const firstUnanswered = questions.findIndex((q) => submittedAnswers[q.id] === undefined);
    if (firstUnanswered !== -1) setCurrentQuestion(firstUnanswered);
  };

  // --- Рендер ---

  // Тест завершён (все ответы отправлены)
  if (allSubmitted) {
    // Проверяем: есть ли у ответов поле is_correct (учитель проверил)
    const hasVerified = Object.values(submittedAnswers).some((a) => a?.is_correct !== undefined);

    // Эссе на проверке (учитель ещё не проверил)
    if (hasEssay && !hasVerified) {
      return (
        <div
          className="w-full rounded-[32px] px-4 py-4 md:px-[30px] md:py-[30px]"
          style={{ background: "#D4F9E1" }}
        >
          <div className="bg-white rounded-xl p-4 md:p-[16px] mb-4">
            <div className="flex flex-col gap-[15px] text-left">
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase", color: "#343E3D" }}>
                Задание
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase", color: "#222222" }}>
                Тема: «{test.name}»
              </p>
              <span className={`inline-flex self-start px-3 py-1 rounded-xl border ${status.borderColor} ${status.textColor}`}
                style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "140%" }}>
                {status.label}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[26px] md:rounded-[32px] p-4 md:p-12 flex flex-col items-center gap-4 md:gap-6">
            <div className="relative w-full max-w-[256px] md:max-w-[833px] h-[98px] md:h-[320px] rounded-xl md:rounded-[32px] overflow-hidden flex items-center justify-center">
              <img
                src="/images/test-not-completed.svg"
                alt="Тест на проверке"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#DB0000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 6V12L16 14" stroke="#DB0000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase", color: "#DB0000" }}>
                На проверке
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Работа проверена (или нет эссе) — показываем результаты
    return (
      <div className="w-full rounded-[32px] px-4 py-4 md:px-[30px] md:py-[30px]" style={{ background: "#D4F9E1" }}>
        <TestResults test={test} answers={submittedAnswers} onBackToMaterials={onBackToMaterials} />
      </div>
    );
  }

  // Вернулся с незавершённым тестом — показываем заглушку
  if (returnedWithProgress) {
    return (
      <div className="w-full rounded-[32px] px-4 py-4 md:px-[30px] md:py-[30px]" style={{ background: "#D4F9E1" }}>
        <div className="bg-white rounded-xl p-4 md:p-[16px] mb-4">
          <div className="flex flex-col gap-[15px] text-left">
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase", color: "#343E3D" }}>
              Задание
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase", color: "#222222" }}>
              Тема: «{test.name}»
            </p>
            <span className={`inline-flex self-start px-3 py-1 rounded-xl border ${status.borderColor} ${status.textColor}`}
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "140%" }}>
              {status.label}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[26px] md:rounded-[32px] p-4 md:p-12 flex flex-col items-center gap-4 md:gap-6">
          <p style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "17px", textTransform: "uppercase", color: "#222222", alignSelf: "flex-start" }}>
            Тест еще не завершен
          </p>

          <div className="relative w-full max-w-[256px] md:max-w-[833px] h-[98px] md:h-[320px] rounded-xl md:rounded-[32px] overflow-hidden flex items-center justify-center">
            <img
              src="/images/test-not-completed.svg"
              alt="Тест не завершён"
              className="w-full h-full object-cover"
            />
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="w-full md:w-auto px-10 py-4 rounded-full cursor-pointer"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "19px",
              textTransform: "uppercase",
              background: "#FFB62F",
              color: "#222222",
            }}
          >
            Вернуться к заданию
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-[32px] px-4 py-4 md:px-[30px] md:py-[30px]"
      style={{ background: "#D4F9E1" }}
    >
      {/* Шапка */}
      <div className="bg-white rounded-xl p-4 md:p-[16px]">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-start justify-between gap-4 cursor-pointer"
        >
          <div className="flex flex-col gap-[15px] text-left">
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase", color: "#343E3D" }}>
              Задание
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase", color: "#222222" }}>
              Тема: «{test.name}»
            </p>
            <span className={`inline-flex self-start px-3 py-1 rounded-xl border ${status.borderColor} ${status.textColor}`}
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "140%" }}>
              {status.label}
            </span>
          </div>
          <div className="w-10 h-10 flex items-center justify-center shrink-0 mt-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
              <path d="M6 9L12 15L18 9" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
      </div>

      {/* Визард вопросов */}
      {expanded && question && (
        <div className="mt-4 bg-white rounded-[26px] md:rounded-[32px] p-4 md:p-12">
          <p style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "17px", textTransform: "uppercase", color: "#222222", marginBottom: "8px" }}>
            Вопрос {currentQuestion + 1} из {total}
          </p>

          <p style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "20px", lineHeight: "140%", color: "#222222", marginBottom: "16px" }}>
            {question.question}
          </p>

          <div className="w-full border-t border-[#D4F9E1] mb-5" />

          {question.type === "radio" && (
            <QuestionRadio question={question} answer={answers[question.id]} disabled={isCurrentAnswered && !isCurrentFromServer}
              onChange={(val) => { markTouched(); setAnswers((p) => ({ ...p, [question.id]: val })); setErrors((p) => ({ ...p, [question.id]: false })); }} />
          )}
          {question.type === "checkbox" && (
            <QuestionCheckbox question={question} answer={answers[question.id]} disabled={isCurrentAnswered && !isCurrentFromServer}
              onChange={(val) => { markTouched(); setAnswers((p) => ({ ...p, [question.id]: val })); setErrors((p) => ({ ...p, [question.id]: false })); }} />
          )}
          {question.type === "text" && (
            <QuestionText question={question} answer={answers[question.id]} disabled={isCurrentAnswered && !isCurrentFromServer}
              onChange={(val) => { markTouched(); setAnswers((p) => ({ ...p, [question.id]: val })); setErrors((p) => ({ ...p, [question.id]: false })); }} />
          )}
          {question.type === "matching" && !question.multi && (
            <QuestionMatching question={question} answer={answers[question.id]} disabled={isCurrentAnswered && !isCurrentFromServer}
              onChange={(val) => { markTouched(); setAnswers((p) => ({ ...p, [question.id]: val })); setErrors((p) => ({ ...p, [question.id]: false })); }}
              draggedTag={draggedTag} setDraggedTag={setDraggedTag} />
          )}
          {question.type === "matching" && question.multi && (
            <QuestionMatchingMulti question={question} answer={answers[question.id]} disabled={isCurrentAnswered && !isCurrentFromServer}
              onChange={(val) => { markTouched(); setAnswers((p) => ({ ...p, [question.id]: val })); setErrors((p) => ({ ...p, [question.id]: false })); }}
              draggedTag={draggedTag} setDraggedTag={setDraggedTag} />
          )}
          {question.type === "essay" && (
            <QuestionEssay question={question} answer={answers[question.id]} disabled={isCurrentAnswered && !isCurrentFromServer}
              onChange={(val) => { markTouched(); setAnswers((p) => ({ ...p, [question.id]: val })); setErrors((p) => ({ ...p, [question.id]: false })); }} />
          )}

          {errors[question.id] && (
            <p className="text-[#DB0000] mt-2 text-input">Заполните это поле</p>
          )}
          {validationMsg && (
            <p className="text-[#DB0000] mt-2 text-input font-semibold">{validationMsg}</p>
          )}

          {/* Индикатор прогресса */}
          {answeredCount > 0 && answeredCount < total && (
            <p className="text-center mt-4" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", color: "#343E3D" }}>
              Отвечено: {answeredCount} из {total}
            </p>
          )}

          <div className="mt-16 flex items-center justify-between w-full">
            <button type="button"
              onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
              disabled={currentQuestion === 0}
              className="w-12 h-12 flex items-center justify-center rounded shrink-0 disabled:opacity-40 cursor-pointer disabled:cursor-default"
              style={{ background: currentQuestion === 0 ? "#F4F4F4" : "#D4F9E1" }}>
              <svg width="33" height="33" viewBox="0 0 33 33" fill="none">
                <path d="M22 7L11 16.5L22 26" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" onClick={handleAnswer}
              disabled={submitting || (isCurrentAnswered && !isCurrentFromServer)}
              className="px-10 py-4 rounded-full cursor-pointer disabled:opacity-50"
              style={{
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase",
                background: (isCurrentAnswered && !isCurrentFromServer) ? "#D3D3D3" : (answers[question.id] !== undefined ? "#FFB62F" : "#D3D3D3"), color: "#222222",
              }}>
              {submitting ? "Отправка..." : (isCurrentFromServer ? "Обновить" : (isCurrentAnswered ? "Отвечено" : "Ответить"))}
            </button>
            <button type="button"
              onClick={() => setCurrentQuestion((p) => Math.min(total - 1, p + 1))}
              disabled={isLast}
              className="w-12 h-12 flex items-center justify-center rounded shrink-0 disabled:opacity-40 cursor-pointer disabled:cursor-default"
              style={{ background: isLast ? "#F4F4F4" : "#D4F9E1" }}>
              <svg width="33" height="33" viewBox="0 0 33 33" fill="none">
                <path d="M11 7L22 16.5L11 26" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
