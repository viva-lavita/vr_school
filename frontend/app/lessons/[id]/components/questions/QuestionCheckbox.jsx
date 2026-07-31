"use client";

export default function QuestionCheckbox({ question, answer, onChange, disabled }) {
  const selected = answer || [];

  const toggle = (index) => {
    if (disabled) return;
    const updated = selected.includes(index)
      ? selected.filter((v) => v !== index)
      : [...selected, index];
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-black" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "17px", textTransform: "uppercase" }}>
        {question.hint || "Выберите несколько вариантов ответа"}
      </p>
      {question.options.map((opt, i) => (
        <label key={i} className={`flex items-center gap-3 ${disabled ? "opacity-50 cursor-default" : "cursor-pointer"}`}>
          <div className="relative w-5 h-5 shrink-0">
            <input
              type="checkbox"
              checked={selected.includes(i)}
              onChange={() => toggle(i)}
              disabled={disabled}
              className="absolute inset-0 opacity-0 w-5 h-5 cursor-pointer"
            />
            <div
              className={`w-5 h-5 border border-[#FFB62F] flex items-center justify-center ${selected.includes(i) ? "bg-[#FFB62F]" : "bg-white"}`}
              style={{ borderRadius: "2px" }}
            >
              {selected.includes(i) && (
                <svg className="w-4 h-4 text-[#222222]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-2 text-black">{opt}</span>
        </label>
      ))}
    </div>
  );
}
