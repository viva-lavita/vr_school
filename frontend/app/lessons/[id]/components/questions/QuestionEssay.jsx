"use client";

export default function QuestionEssay({ question, answer, onChange, disabled }) {
  const safeAnswer = typeof answer === "string" ? answer : "";
  return (
    <div className="flex flex-col gap-4">
      <p className="text-black" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "17px", textTransform: "uppercase" }}>
        Напишите эссе
      </p>
      <div className="relative">
        <textarea
          maxLength={question.max_length}
          value={safeAnswer}
          onChange={(e) => !disabled && onChange(e.target.value)}
          disabled={disabled}
          placeholder="Напишите ответ"
          className="w-full px-5 py-4 text-black resize-none"
          style={{
            background: disabled ? "#E8E8E8" : "#F4F4F4",
            borderRadius: "12px",
            height: "207px",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "16px",
            lineHeight: "140%",
          }}
        />
        <span className="absolute bottom-3 right-4 text-input text-[#343E3D]">
          до {question.max_length} символов
        </span>
      </div>
    </div>
  );
}
