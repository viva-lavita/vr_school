"use client";

import { useState, useEffect } from "react";
import QuestionRadio from "./questions/QuestionRadio";
import QuestionCheckbox from "./questions/QuestionCheckbox";
import QuestionText from "./questions/QuestionText";
import QuestionMatching from "./questions/QuestionMatching";
import QuestionMatchingMulti from "./questions/QuestionMatchingMulti";
import QuestionEssay from "./questions/QuestionEssay";
import TestResults from "./TestResults";

const STATUS_CONFIG = {
  new: { label: "новое", borderColor: "border-[#FFB62F]", textColor: "text-[#FFB62F]" },
  in_progress: { label: "в работе", borderColor: "border-[#DB0000]", textColor: "text-[#DB0000]" },
  review: { label: "на проверке", borderColor: "border-[#FFB62F]", textColor: "text-[#FFB62F]" },
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

/**
 * Карточка теста.
 *
 * Два отдельных флага:
 * - returnedWithProgress: загружен прогресс из localStorage при монтировании
 *   (ученик закрыл браузер и вернулся) → показать "ТЕСТ ЕЩЕ НЕ ЗАВЕРШЕН"
 * - isTakingTest: ученик активно проходит тест → показать визард
 *
 * Прогресс сохраняется в localStorage при каждом ответе.
 * При завершении теста — прогресс удаляется.
 */
export default function TestCard({ test, user, onBackToMaterials }) {
  const [expanded, setExpanded] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [draggedTag, setDraggedTag] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [returnedWithProgress, setReturnedWithProgress] = useState(false);
  const [isTakingTest, setIsTakingTest] = useState(false);
  const [validationMsg, setValidationMsg] = useState(null);
  const questions = test.questions || [];
  const total = questions.length;
  const question = questions[currentQuestion];
  const userId = user?.pk;

  // Есть сохранённый прогресс (для статуса "в работе")
  const hasAnyProgress = returnedWithProgress || (isTakingTest && Object.keys(answers).length > 0);
  const currentStatus = completed ? test.status : (hasAnyProgress ? "in_progress" : test.status);
  const status = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.new;
  const isLast = currentQuestion === total - 1;

  // Загружаем сохранённый прогресс при монтировании
  useEffect(() => {
    if (!userId) return;
    const saved = loadTestProgress(userId, test.id);
    if (saved && saved.answers && Object.keys(saved.answers).length > 0) {
      setReturnedWithProgress(true);
      setAnswers(saved.answers);
      setCurrentQuestion(saved.currentQuestion || 0);
    }
  }, [userId, test.id]);

  // Сохраняем прогресс при изменении ответов (только если ученик активно проходит)
  useEffect(() => {
    if (!userId || !isTakingTest || completed) return;
    saveTestProgress(userId, test.id, {
      answers,
      currentQuestion,
      startedAt: Date.now(),
    });
  }, [userId, isTakingTest, completed, answers, currentQuestion, test.id]);

  const validateQuestion = (q) => {
    const ans = answers[q.id];
    if (q.type === "radio") return !!ans;
    if (q.type === "checkbox") return Array.isArray(ans) && ans.length > 0;
    if (q.type === "text") return typeof ans === "string" && ans.trim().length > 0;
    if (q.type === "matching") {
      if (!ans) return false;
      if (q.multi) return Object.values(ans).some((v) => Array.isArray(v) ? v.length > 0 : !!v);
      return Object.values(ans).length > 0;
    }
    if (q.type === "essay") return typeof ans === "string" && ans.trim().length > 0;
    return true;
  };

  const handleAnswer = () => {
    if (!validateQuestion(question)) {
      setErrors((prev) => ({ ...prev, [question.id]: true }));
      return;
    }
    setErrors((prev) => ({ ...prev, [question.id]: false }));
    setValidationMsg(null);

    if (isLast) {
      const missing = [];
      questions.forEach((q, i) => { if (!validateQuestion(q)) missing.push(i + 1); });
      if (missing.length > 0) {
        setValidationMsg(`Не заполнены задания: ${missing.join(", ")}`);
        const firstMissing = questions.findIndex((q) => !validateQuestion(q));
        if (firstMissing >= 0) setCurrentQuestion(firstMissing);
        return;
      }
      setCompleted(true);
      setIsTakingTest(false);
      if (userId) clearTestProgress(userId, test.id);
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  // Кнопка "Продолжить" — убираем заглушку, показываем визард
  const handleContinue = () => {
    setReturnedWithProgress(false);
    setIsTakingTest(true);
  };

  if (completed) {
    return (
      <div
        className="w-full rounded-[32px] px-4 py-4 md:px-[60px] md:py-[60px]"
        style={{ background: "#D4F9E1" }}
      >
        <TestResults test={test} answers={answers} onBackToMaterials={onBackToMaterials} />
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-[32px] px-4 py-4 md:px-[30px] md:py-[30px]"
      style={{ background: "#D4F9E1" }}
    >
      {/* Свёрнутая шапка задания */}
      <div className="bg-white rounded-xl p-4 md:p-[16px]">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-start justify-between gap-4 cursor-pointer"
        >
          <div className="flex flex-col gap-[15px] text-left">
            <p className="text-[#343E3D]" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase" }}>
              Задание
            </p>
            <p className="text-black" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase" }}>
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

      {/* Раскрытый блок теста */}
      {expanded && (
        <div className="mt-4 bg-white rounded-[26px] md:rounded-[32px] p-4 md:p-12">
          {returnedWithProgress ? (
            /* Ученик вернулся с незавершённым тестом — заглушка */
            <div className="flex flex-col items-center gap-4 md:gap-6">
              <p className="text-black self-start" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "17px", textTransform: "uppercase" }}>
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
                Продолжить
              </button>
            </div>
          ) : (
            /* Визард вопросов */
            question && (
              <>
                <p className="text-black mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "17px", textTransform: "uppercase" }}>
                  Вопрос {currentQuestion + 1} из {total}
                </p>

                <p className="text-black mb-4" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "20px", lineHeight: "140%" }}>
                  {question.question}
                </p>

                <div className="w-full border-t border-[#D4F9E1] mb-5" />

                {question.type === "radio" && (
                  <QuestionRadio question={question} answer={answers[question.id]} onChange={(val) => { setAnswers((p) => ({ ...p, [question.id]: val })); setErrors((p) => ({ ...p, [question.id]: false })); }} />
                )}
                {question.type === "checkbox" && (
                  <QuestionCheckbox question={question} answer={answers[question.id]} onChange={(val) => { setAnswers((p) => ({ ...p, [question.id]: val })); setErrors((p) => ({ ...p, [question.id]: false })); }} />
                )}
                {question.type === "text" && (
                  <QuestionText question={question} answer={answers[question.id]} onChange={(val) => { setAnswers((p) => ({ ...p, [question.id]: val })); setErrors((p) => ({ ...p, [question.id]: false })); }} />
                )}
                {question.type === "matching" && !question.multi && (
                  <QuestionMatching question={question} answer={answers[question.id]} onChange={(val) => { setAnswers((p) => ({ ...p, [question.id]: val })); setErrors((p) => ({ ...p, [question.id]: false })); }} draggedTag={draggedTag} setDraggedTag={setDraggedTag} />
                )}
                {question.type === "matching" && question.multi && (
                  <QuestionMatchingMulti question={question} answer={answers[question.id]} onChange={(val) => { setAnswers((p) => ({ ...p, [question.id]: val })); setErrors((p) => ({ ...p, [question.id]: false })); }} draggedTag={draggedTag} setDraggedTag={setDraggedTag} />
                )}
                {question.type === "essay" && (
                  <QuestionEssay question={question} answer={answers[question.id]} onChange={(val) => { setAnswers((p) => ({ ...p, [question.id]: val })); setErrors((p) => ({ ...p, [question.id]: false })); }} />
                )}

                {errors[question.id] && (
                  <p className="text-[#DB0000] mt-2 text-input">Заполните это поле</p>
                )}
                {validationMsg && (
                  <p className="text-[#DB0000] mt-2 text-input font-semibold">{validationMsg}</p>
                )}

                <div className="mt-16 flex items-center justify-between w-full ">
                  <button type="button" onClick={() => { setCurrentQuestion((p) => Math.max(0, p - 1)); }}
                    disabled={currentQuestion === 0}
                    className="w-12 h-12 flex items-center justify-center rounded shrink-0 disabled:opacity-40 cursor-pointer disabled:cursor-default"
                    style={{ background: currentQuestion === 0 ? "#F4F4F4" : "#D4F9E1" }}>
                    <svg width="33" height="33" viewBox="0 0 33 33" fill="none"><path d="M22 7L11 16.5L22 26" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                  <button type="button" onClick={handleAnswer}
                    className="px-10 py-4 rounded-full cursor-pointer"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase",
                      background: answers[question.id] ? "#FFB62F" : "#D3D3D3", color: "#222222" }}>
                    {isLast ? "Отправить на проверку" : "Ответить"}
                  </button>
                  <button type="button" onClick={() => { setCurrentQuestion((p) => Math.min(total - 1, p + 1)); }}
                    disabled={currentQuestion === total - 1}
                    className="w-12 h-12 flex items-center justify-center rounded shrink-0 disabled:opacity-40 cursor-pointer disabled:cursor-default"
                    style={{ background: currentQuestion === total - 1 ? "#F4F4F4" : "#D4F9E1" }}>
                    <svg width="33" height="33" viewBox="0 0 33 33" fill="none"><path d="M11 7L22 16.5L11 26" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
              </>
            )
          )}
        </div>
      )}
    </div>
  );
}
