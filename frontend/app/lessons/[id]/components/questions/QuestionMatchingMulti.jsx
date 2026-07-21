"use client";

import { useState } from "react";

/**
 * Тип задания №4 — Задание на соответствие с НЕСКОЛЬКИМИ ответами.
 * Каждый лейбл может иметь несколько тегов.
 * На мобилке: клик по зоне выбирает её, клик по тегу добавляет в выбранную зону.
 * На десктопе: drag&drop + клик.
 */
export default function QuestionMatchingMulti({ question, answer, onChange, draggedTag, setDraggedTag }) {
  const labels = question.labels || [];
  const [selectedZone, setSelectedZone] = useState(null);

  // Получить теги для зоны (всегда массив)
  const getZoneTags = (i) => {
    const val = answer?.[i];
    return Array.isArray(val) ? val : (val ? [val] : []);
  };

  // Добавить тег в зону
  const addTagToZone = (zoneIndex, tag) => {
    const updated = { ...(answer || {}) };
    const arr = getZoneTags(zoneIndex);
    if (!arr.includes(tag)) {
      arr.push(tag);
      updated[zoneIndex] = arr;
      onChange(updated);
    }
  };

  // Убрать тег из зоны
  const removeTagFromZone = (zoneIndex, tag) => {
    const updated = { ...(answer || {}) };
    updated[zoneIndex] = getZoneTags(zoneIndex).filter((t) => t !== tag);
    onChange(updated);
  };

  // Обработчик drop (для drag&drop)
  const handleDrop = (zoneIndex, e) => {
    e.preventDefault();
    e.currentTarget.style.background = "";
    if (draggedTag) {
      addTagToZone(zoneIndex, draggedTag);
      setDraggedTag(null);
    }
  };

  // Рендер зоны с несколькими тегами
  const renderZone = (i) => {
    const zoneTags = getZoneTags(i);
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
        {zoneTags.map((tag, ti) => (
          <span key={ti}
            className="inline-flex items-center justify-center gap-2 px-5 py-1.5 rounded-xl bg-[#22C55E] text-black cursor-pointer w-full"
            onClick={(e) => { e.stopPropagation(); removeTagFromZone(i, tag); }}
            style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase" }}>
            {tag}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3L3 11M3 3L11 11" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        ))}
      </div>
    );
  };

  // Все размещённые теги (для фильтрации в зелёной полоске)
  const allPlacedTags = Object.values(answer || {}).flat();

  return (
    <div className="flex flex-col gap-5">
      {/* Подсказка */}
      <p className="text-black" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "17px", textTransform: "uppercase" }}>
        {question.hint || "Перетащите все подходящие характеристики. Внимание! Каждому лейблу может соответствовать несколько тэгов!"}
      </p>

      {/* Десктоп: лейблы слева, зоны справа */}
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

      {/* Мобилка: чередование */}
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

      {/* Подсказка для мобилки */}
      <p className="w-full text-center text-input text-dark md:hidden" style={{ fontStyle: "italic" }}>
        Нажмите на оранжевую зону сверху, затем на тег
      </p>

      {/* Теги в зелёной полоске */}
      <div className="w-full rounded-xl p-6 min-h-[79px] flex flex-wrap justify-center items-center gap-3"
        style={{ background: "#D4F9E1" }}>
        {(question.tags || []).filter((tag) => !allPlacedTags.includes(tag)).map((tag, i) => (
          <button key={i} type="button" draggable
            onDragStart={() => setDraggedTag(tag)}
            onDragEnd={() => setDraggedTag(null)}
            onClick={() => {
              if (selectedZone !== null) {
                addTagToZone(selectedZone, tag);
              } else {
                // Клик без выбранной зоны — ставим в первую пустую
                for (let j = 0; j < labels.length; j++) {
                  if (getZoneTags(j).length === 0) {
                    addTagToZone(j, tag);
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
        ))}
      </div>
    </div>
  );
}
