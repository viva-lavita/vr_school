"use client";

export default function QuestionText({ question, answer, onChange }) {
  return (
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
          height: "120px",
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
  );
}
