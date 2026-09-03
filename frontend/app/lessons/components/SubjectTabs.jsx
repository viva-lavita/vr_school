"use client";

import { useEffect, useRef, useState } from "react";

function MobileDropdown({ subjects, active, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selected = subjects.find((s) => s.id === active);

  return (
    <div className="md:hidden relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-3 rounded-full border-2 border-[#22C55E] bg-white cursor-pointer"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 700,
          fontSize: "14px",
          lineHeight: "17px",
          textTransform: "uppercase",
          color: "#222222",
        }}
      >
        <span>{selected?.name ?? "Выберите предмет"}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M5 8L10 13L15 8" stroke="#343E3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-20 w-full mt-2 rounded-3xl overflow-hidden shadow-lg"
          style={{ background: "#D4F9E1" }}
        >
          <div className="max-h-[200px] overflow-y-auto py-2 px-2">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                type="button"
                onClick={() => {
                  onChange(subject.id);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 rounded-full cursor-pointer transition-colors"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "14px",
                  lineHeight: "17px",
                  textTransform: "uppercase",
                  color: "#222222",
                  background: active === subject.id ? "#FEFEFE" : "transparent",
                }}
              >
                {subject.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubjectTabs({ subjects, active, onChange }) {
  return (
    <>
      {/* Desktop: wrap to multiple rows */}
      <div className="hidden lg:flex flex-wrap gap-4 overflow-x-hidden">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            type="button"
            onClick={() => onChange(subject.id)}
            className="flex-shrink-0 flex justify-center items-center px-6 py-3 rounded-full border-2 border-[#22C55E] cursor-pointer transition-colors"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "19px",
              textTransform: "uppercase",
              background: active === subject.id ? "#D4F9E1" : "#FEFEFE",
              color: "#222222",
            }}
          >
            {subject.name}
          </button>
        ))}
      </div>

      {/* Tablet: 2x2 grid */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            type="button"
            onClick={() => onChange(subject.id)}
            className="flex justify-center items-center px-6 py-3 rounded-full border-2 border-[#22C55E] cursor-pointer transition-colors"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "19px",
              textTransform: "uppercase",
              background: active === subject.id ? "#D4F9E1" : "#FEFEFE",
              color: "#222222",
            }}
          >
            {subject.name}
          </button>
        ))}
      </div>

      {/* Mobile: custom dropdown */}
      <MobileDropdown subjects={subjects} active={active} onChange={onChange} />
    </>
  );
}
