"use client";

export default function QuestionCheckbox({ question, answer, onChange }) {
  const selected = answer || [];

  const toggle = (opt) => {
    const updated = selected.includes(opt)
      ? selected.filter((v) => v !== opt)
      : [...selected, opt];
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-black" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "17px", textTransform: "uppercase" }}>
        {question.hint || "Выберите несколько вариантов ответа"}
      </p>
      {question.options.map((opt, i) => (
        <label key={i} className="flex items-center gap-3 cursor-pointer">
          <div className="relative w-5 h-5 shrink-0">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
              className="absolute inset-0 opacity-0 w-5 h-5 cursor-pointer"
            />
            <div
              className={`w-5 h-5 border border-[#FFB62F] flex items-center justify-center ${selected.includes(opt) ? "bg-[#FFB62F]" : "bg-white"}`}
              style={{ borderRadius: "2px" }}
            >
              {selected.includes(opt) && (
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
