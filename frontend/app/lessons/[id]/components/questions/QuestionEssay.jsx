"use client";

/**
 * Тип задания №5 — Открытый ответ (эссе).
 * Многострочное поле ввода от 0 до 5000 символов.
 * Отличие от текстового ответа: больше высота (207px), есть заголовок "НАПИШИТЕ ЭССЕ",
 * плейсхолдер "Напишите ответ", счётчик "до 5000 символов".
 * Кнопка отправки: "ОТПРАВИТЬ НА ПРОВЕРКУ" (не "ОТВЕТИТЬ").
 */
export default function QuestionEssay({ question, answer, onChange }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Заголовок типа задания */}
      <p className="text-black" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "17px", textTransform: "uppercase" }}>
        Напишите эссе
      </p>

      {/* Поле ввода эссе */}
      <div className="relative">
        <textarea
          maxLength={question.max_length}
          value={answer || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Напишите ответ"
          className="w-full px-5 py-4 text-black resize-none"
          style={{
            background: "#F4F4F4",
            borderRadius: "12px",
            height: "207px",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "16px",
            lineHeight: "140%",
          }}
        />
        {/* Счётчик символов */}
        <span className="absolute bottom-3 right-4 text-input text-[#343E3D]">
          до {question.max_length} символов
        </span>
      </div>
    </div>
  );
}
