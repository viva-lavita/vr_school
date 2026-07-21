"use client";

export default function QuestionRadio({ question, answer, onChange }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-black" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "17px", textTransform: "uppercase" }}>
        Выберите один ответ
      </p>
      {question.options.map((opt, i) => (
        <label key={i} className="flex items-center gap-3 cursor-pointer">
          <div className="relative w-5 h-5 shrink-0">
            <input
              type="radio"
              name={`q_${question.id}`}
              checked={answer === opt}
              onChange={() => onChange(opt)}
              className="absolute inset-0 opacity-0 w-5 h-5 cursor-pointer"
            />
            <div className={`w-5 h-5 rounded-full border-[1.5px] ${answer === opt ? "border-[#FFB62F]" : "border-[#FFB62F]"}`}>
              {answer === opt && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full bg-[#FFB62F]" />
              )}
            </div>
          </div>
          <span className="text-2 text-black">{opt}</span>
        </label>
      ))}
    </div>
  );
}
