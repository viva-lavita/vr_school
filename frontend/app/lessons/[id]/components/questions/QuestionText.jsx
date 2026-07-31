"use client";

export default function QuestionText({ question, answer, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-black" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "17px", textTransform: "uppercase" }}>
        Введите ответ
      </p>
      <input
        type="text"
        maxLength={question.max_length}
        value={answer || ""}
        onChange={(e) => !disabled && onChange(e.target.value)}
        disabled={disabled}
        placeholder="Напишите ответ"
        className="w-full px-5 py-4 text-black"
        style={{
          background: disabled ? "#E8E8E8" : "#F4F4F4",
          borderRadius: "12px",
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          fontSize: "16px",
          lineHeight: "140%",
        }}
      />
    </div>
  );
}
