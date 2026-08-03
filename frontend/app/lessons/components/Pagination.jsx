"use client";

export default function Pagination({ current, total, onChange }) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onChange(page)}
          className="flex flex-col justify-center items-center w-[39px] h-[42px] rounded cursor-pointer transition-colors"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "16px",
            lineHeight: "140%",
            border: current === page ? "1.5px solid #222222" : "1.5px solid transparent",
            color: current === page ? "#222222" : "#343E3D",
          }}
        >
          {page}
        </button>
      ))}
      {current < total && (
        <button
          type="button"
          onClick={() => onChange(current + 1)}
          className="flex justify-center items-center w-[39px] h-[42px] rounded cursor-pointer"
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M1 6H15M15 6L10 1M15 6L10 11" stroke="#343E3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
