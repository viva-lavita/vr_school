"use client";

import Link from "next/link";

const STATUS_CONFIG = {
  new: { label: "новый", borderColor: "border-[#FFB62F]", textColor: "text-[#FFB62F]" },
  completed: { label: "пройден", borderColor: "border-[#22C55E]", textColor: "text-[#22C55E]" },
  in_progress: { label: "в работе", borderColor: "border-[#DB0000]", textColor: "text-[#DB0000]" },
};

export default function LessonCard({ lesson, number }) {
  const status = STATUS_CONFIG[lesson.status] || STATUS_CONFIG.new;
  const image = lesson.image || "/images/vr-headset-portrait.png";

  const titleStyle = {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "19px",
  };

  const descStyle = {
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    fontSize: "16px",
    lineHeight: "140%",
  };

  const badgeStyle = {
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "140%",
  };

  return (
    <Link
      href={`/lessons/${lesson.id}`}
      className="block w-full bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Mobile: vertical */}
      <div className="md:hidden flex flex-col p-4 gap-[15px]">
        <div className="flex flex-col gap-[15px]">
          <h3 className="text-black uppercase" style={titleStyle}>
            {number}. {lesson.name}
          </h3>
          <p className="text-black" style={descStyle}>
            {lesson.description}
          </p>
        </div>
        <div className="w-full h-[200px] rounded-xl overflow-hidden">
          <img src={image} alt={lesson.name} className="w-full h-full object-cover" />
        </div>
        <span
          className={`inline-flex items-center self-start px-3 py-1 rounded-xl border ${status.borderColor} ${status.textColor}`}
          style={badgeStyle}
        >
          {status.label}
        </span>
      </div>

      {/* Desktop/tablet: horizontal */}
      <div className="hidden md:flex gap-[15px] p-4 min-h-[275px]">
        <div className="flex-1 flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex flex-col gap-[15px]">
            <h3 className="text-black uppercase truncate" style={titleStyle}>
              {number}. {lesson.name}
            </h3>
            <p className="text-black line-clamp-3" style={descStyle}>
              {lesson.description}
            </p>
          </div>
          <span
            className={`inline-flex items-center self-start px-3 py-1 rounded-xl border ${status.borderColor} ${status.textColor}`}
            style={badgeStyle}
          >
            {status.label}
          </span>
        </div>
        <div className="w-[200px] h-[200px] shrink-0 rounded-xl overflow-hidden">
          <img src={image} alt={lesson.name} className="w-full h-full object-cover" />
        </div>
      </div>
    </Link>
  );
}
