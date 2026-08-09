"use client";

import { useState } from "react";

export default function TestResults({ test, answers, onBackToMaterials }) {
  const [expanded, setExpanded] = useState(false);
  const questions = test.questions || [];
  const hasEssay = questions.some((q) => q.type === "essay");

  const answerValues = Object.values(answers || {});
  const verifiedAnswers = answerValues.filter((a) => a?.is_correct !== undefined);
  const isVerified = verifiedAnswers.length > 0;
  const allCorrect = isVerified && verifiedAnswers.every((a) => a.is_correct === true);
  const anyIncorrect = verifiedAnswers.some((a) => a.is_correct === false);
  const allEssaysVerified = !hasEssay || answerValues
    .filter((a) => a?.is_verified !== undefined)
    .every((a) => a.is_verified === true);

  let statusLabel, statusColor;
  if (hasEssay && !allEssaysVerified) {
    statusLabel = "на проверке";
    statusColor = "#DB0000";
  } else if (isVerified && allCorrect) {
    statusLabel = "пройдено";
    statusColor = "#22C55E";
  } else if (isVerified && anyIncorrect) {
    statusLabel = "не пройдено";
    statusColor = "#DB0000";
  } else if (!isVerified && allEssaysVerified) {
    // Только эссе без других вопросов — проверено
    statusLabel = "проверено";
    statusColor = "#22C55E";
  } else {
    statusLabel = "на проверке";
    statusColor = "#DB0000";
  }

  // Оценка: приоритет — score из API, затем расчёт
  const score = test.score ?? (
    (verifiedAnswers.length > 0 || allEssaysVerified) && (isVerified || allEssaysVerified)
      ? (anyIncorrect ? 2 : 4)
      : null
  );

  return (
    <>
      <div className="w-full rounded-[20px] md:rounded-[32px] px-3 py-3 md:px-5 md:py-5" style={{ background: "#D4F9E1" }}>
        <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4">
          <button type="button" onClick={() => setExpanded(!expanded)}
            className="w-full flex items-start justify-between gap-3 md:gap-4 cursor-pointer">
            <div className="flex flex-col gap-2 md:gap-[15px] text-left min-w-0">
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(13px, 1vw + 6px, 16px)", lineHeight: "19px", textTransform: "uppercase", color: "#343E3D" }}>
                Задание
              </p>
              <p className="truncate" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "clamp(13px, 1vw + 6px, 16px)", lineHeight: "19px", textTransform: "uppercase", color: "#222222" }}>
                Тема: «{test.name}»
              </p>
              <span className="inline-flex self-start px-2 py-0.5 md:px-3 md:py-1 rounded-lg md:rounded-xl border"
                style={{ borderColor: statusColor, color: statusColor, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "clamp(12px, 0.8vw + 6px, 14px)", lineHeight: "140%" }}>
                {statusLabel}
              </span>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0 mt-1 md:mt-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
                <path d="M6 9L12 15L18 9" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        </div>

        {expanded && (
          <div className="mt-2 md:mt-3 bg-white rounded-[18px] md:rounded-[32px] p-3 md:p-8">
            <p className="text-black mb-3 md:mb-4"
              style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "clamp(13px, 1vw + 6px, 16px)", lineHeight: "19px", textTransform: "uppercase" }}>
              Результат проверки
            </p>

            <p className="text-black mb-3 md:mb-4"
              style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "clamp(13px, 1vw + 6px, 16px)", lineHeight: "19px", textTransform: "uppercase" }}>
              Тема: «{test.name}»
            </p>

            {score !== null && (
              <>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "clamp(16px, 1.2vw + 6px, 20px)", lineHeight: "140%", color: "#222222" }}>
                    Оценка за проверочную работу:
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "clamp(16px, 1.2vw + 6px, 20px)", lineHeight: "140%", color: "#222222" }}>
                    {score}
                  </p>
                </div>

                <textarea disabled placeholder="Рекомендации" className="w-full px-4 py-3 md:px-5 md:py-4 resize-none"
                  style={{
                    background: "#F4F4F4", borderRadius: "12px", height: "clamp(80px, 8vw, 120px)",
                    fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "clamp(13px, 1vw + 4px, 16px)", lineHeight: "140%", color: "#343E3D",
                  }} />
              </>
            )}

            {score === null && (
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#DB0000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6V12L16 14" stroke="#DB0000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "clamp(13px, 1vw + 6px, 16px)", lineHeight: "19px", textTransform: "uppercase", color: "#DB0000" }}>
                  На проверке
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
