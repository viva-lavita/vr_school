"use client";

import { useState } from "react";

export default function QuestionMatchingMulti({ question, answer, onChange, draggedTag, setDraggedTag, disabled }) {
  const labels = question.labels || [];
  const tags = question.tags || [];
  const [selectedZone, setSelectedZone] = useState(null);

  // Получить индексы тегов для зоны (всегда массив)
  const getZoneTagIndices = (i) => {
    const val = answer?.[i];
    return Array.isArray(val) ? val : (val !== undefined ? [val] : []);
  };

  const addTagToZone = (zoneIndex, tagIndex) => {
    if (disabled) return;
    const updated = { ...(answer || {}) };
    const arr = getZoneTagIndices(zoneIndex);
    if (!arr.includes(tagIndex)) {
      arr.push(tagIndex);
      updated[zoneIndex] = arr;
      onChange(updated);
    }
  };

  const removeTagFromZone = (zoneIndex, tagIndex) => {
    if (disabled) return;
    const updated = { ...(answer || {}) };
    updated[zoneIndex] = getZoneTagIndices(zoneIndex).filter((t) => t !== tagIndex);
    onChange(updated);
  };

  const handleDrop = (zoneIndex, e) => {
    e.preventDefault();
    e.currentTarget.style.background = "";
    if (disabled || draggedTag === null) return;
    addTagToZone(zoneIndex, draggedTag);
    setDraggedTag(null);
  };

  // Рендер зоны
  const renderZone = (i) => {
    const zoneTagIndices = getZoneTagIndices(i);
    const isSelected = selectedZone === i;
    return (
      <div
        key={`zone-${i}`}
        className={`flex flex-col gap-2 rounded-xl border-2 px-4 py-3 min-h-[43px] transition-colors cursor-pointer select-none ${isSelected ? "border-[#FFB62F] bg-[#FFF3E0]" : "border-[#FFB62F]"}`}
        style={{ touchAction: "manipulation" }}
        onClick={() => setSelectedZone(isSelected ? null : i)}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = "#FFF3E0"; }}
        onDragLeave={(e) => { if (!isSelected) e.currentTarget.style.background = ""; }}
        onDrop={(e) => handleDrop(i, e)}
      >
        {zoneTagIndices.map((tagIndex, ti) => (
          <span key={ti}
            className="inline-flex items-center justify-center gap-2 px-5 py-1.5 rounded-xl bg-[#22C55E] text-black cursor-pointer w-full"
            onClick={(e) => { e.stopPropagation(); removeTagFromZone(i, tagIndex); }}
            style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase" }}>
            {tags[tagIndex]}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3L3 11M3 3L11 11" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        ))}
      </div>
    );
  };

  // Все размещённые индексы тегов
  const allPlacedIndices = Object.values(answer || {}).flat();

  return (
    <div className="flex flex-col gap-5">
      <p className="text-black" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "17px", textTransform: "uppercase" }}>
        {question.hint || "Перетащите все подходящие характеристики. Внимание! Каждому лейблу может соответствовать несколько тэгов!"}
      </p>

      {/* Десктоп */}
      <div className="hidden lg:flex gap-5">
        <div className="flex flex-col gap-5 flex-1">
          {labels.map((label, i) => (
            <div key={i} className="w-full flex items-center justify-center px-4 py-3 rounded-xl border-2 border-[#22C55E]"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase", color: "#222222", textAlign: "center", wordBreak: "break-word" }}>
              {label}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-5 flex-1">
          {labels.map((_, i) => renderZone(i))}
        </div>
      </div>

      {/* Мобилка */}
      <div className="flex flex-col lg:hidden gap-4">
        {labels.map((label, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="w-full flex items-center justify-center px-4 py-3 rounded-xl border-2 border-[#22C55E]"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(12px, 1.5vw + 4px, 16px)", lineHeight: "19px", textTransform: "uppercase", color: "#222222", textAlign: "center", wordBreak: "break-word" }}>
              {label}
            </div>
            {renderZone(i)}
          </div>
        ))}
      </div>

      <p className="w-full text-center text-input text-dark md:hidden" style={{ fontStyle: "italic" }}>
        Нажмите на оранжевую зону сверху, затем на тег
      </p>

      {/* Теги */}
      <div className="w-full rounded-xl p-6 min-h-[79px] flex flex-wrap justify-center items-center gap-3"
        style={{ background: "#D4F9E1" }}>
        {tags.map((tag, i) => (
          !allPlacedIndices.includes(i) && (
            <button key={i} type="button" draggable
              onDragStart={() => setDraggedTag(i)}
              onDragEnd={() => setDraggedTag(null)}
              onClick={() => {
                if (selectedZone !== null) {
                  addTagToZone(selectedZone, i);
                } else {
                  for (let j = 0; j < labels.length; j++) {
                    if (getZoneTagIndices(j).length === 0) {
                      addTagToZone(j, i);
                      break;
                    }
                  }
                }
              }}
              className="px-6 py-1.5 rounded-xl cursor-pointer"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase", background: "#22C55E", color: "#222222" }}
            >
              {tag}
            </button>
          )
        ))}
      </div>
    </div>
  );
}
