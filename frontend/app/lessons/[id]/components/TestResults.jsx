"use client";

/**
 * Итоговая страница после прохождения всех вопросов проверочной работы.
 * Показывает:
 * - Список всех вопросов с ответами пользователя
 * - Статус проверки (новое / на проверке / пройдено / не пройдено)
 * - Оценку (если есть)
 * - Кнопку возврата к материалам урока
 */
export default function TestResults({ test, answers, onBackToMaterials }) {
  const questions = test.questions || [];
  const hasEssay = questions.some((q) => q.type === "essay");

  // Статус зависит от наличия эссе
  const status = hasEssay ? "review" : "new";
  const statusLabel = hasEssay ? "на проверке" : "новое";
  const statusColor = hasEssay ? "#FFB62F" : "#FFB62F";

  return (
    <div className="flex flex-col gap-6 mb-20">
      {/* Заголовок результатов */}
      <div className="bg-white rounded-xl p-6">
        <h2
          className="text-[#343E3D] mb-4"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase" }}
        >
          Результаты проверочной работы
        </h2>
        <p
          className="text-black mb-2"
          style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase" }}
        >
          Тема: «{test.name}»
        </p>
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center px-3 py-1 rounded-xl border"
            style={{ borderColor: statusColor, color: statusColor, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "140%" }}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Список ответов */}
      {questions.map((q, i) => {
        const userAnswer = answers[q.id];
        let answerText = "Не отвечено";

        if (userAnswer !== undefined && userAnswer !== null) {
          if (q.type === "radio") answerText = userAnswer;
          else if (q.type === "checkbox") answerText = Array.isArray(userAnswer) ? userAnswer.join(", ") : "Не отвечено";
          else if (q.type === "text") answerText = userAnswer || "Не отвечено";
          else if (q.type === "matching") {
            if (q.multi) {
              const items = Object.entries(userAnswer || {}).map(([k, v]) => {
                const label = q.labels?.[k] || `Зона ${k + 1}`;
                const tags = Array.isArray(v) ? v.join(", ") : v;
                return `${label}: ${tags}`;
              });
              answerText = items.length > 0 ? items.join("; ") : "Не отвечено";
            } else {
              const items = Object.entries(userAnswer || {}).map(([k, v]) => {
                const label = q.labels?.[k] || `Зона ${k + 1}`;
                return `${label}: ${v}`;
              });
              answerText = items.length > 0 ? items.join("; ") : "Не отвечено";
            }
          }
          else if (q.type === "essay") answerText = userAnswer || "Не отвечено";
        }

        return (
          <div key={q.id} className="bg-white rounded-xl p-4">
            <p
              className="text-[#343E3D] mb-1"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "14px", lineHeight: "17px", textTransform: "uppercase" }}
            >
              Вопрос {i + 1} из {questions.length}
            </p>
            <p
              className="text-black mb-2"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "16px", lineHeight: "140%" }}
            >
              {q.question}
            </p>
            <p
              className="text-[#343E3D] italic"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "140%" }}
            >
              Ответ: {answerText}
            </p>
          </div>
        );
      })}

      {/* Кнопка возврата к материалам */}
      <button
        type="button"
        onClick={onBackToMaterials}
        className="self-start underline cursor-pointer"
        style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase", color: "#222222" }}
      >
        Вернуться к материалам урока
      </button>
    </div>
  );
}
