"use client";

/**
 * Тип задания №4 — Соответствие с ОДНИМ ответом.
 * Лейблы (зелёные) слева, зоны для ответов (оранжевые) справа.
 * Теги (зелёные) внизу в зелёной полоске.
 * На десктопе: лейблы и зоны рядом. На мобилке: чередование.
 */
export default function QuestionMatching({ question, answer, onChange, draggedTag, setDraggedTag, disabled }) {
  const labels = question.labels || [];
  const tags = question.tags || [];
  const placedIndices = Object.values(answer || {});

  const placeTag = (tagIndex) => {
    if (disabled) return;
    const updated = { ...(answer || {}) };
    for (let i = 0; i < labels.length; i++) {
      if (updated[i] === undefined) { updated[i] = tagIndex; break; }
    }
    onChange(updated);
  };

  const removeTag = (zoneIndex) => {
    if (disabled) return;
    const updated = { ...(answer || {}) };
    delete updated[zoneIndex];
    onChange(updated);
  };

  const handleDrop = (zoneIndex, e) => {
    e.preventDefault();
    e.currentTarget.style.background = "";
    if (disabled || draggedTag === null) return;
    const updated = { ...(answer || {}) };
    updated[zoneIndex] = draggedTag;
    onChange(updated);
    setDraggedTag(null);
  };

  // Рендер зоны
  const renderZone = (i) => (
    <div key={`zone-${i}`}
      className="flex items-center justify-center rounded-xl border-2 border-[#FFB62F] h-[43px] px-4 py-3"
      onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = "#FFF3E0"; }}
      onDragLeave={(e) => { e.currentTarget.style.background = ""; }}
      onDrop={(e) => handleDrop(i, e)}>
      {answer?.[i] !== undefined && (
        <span className="inline-flex items-center gap-2 px-5 py-1.5 rounded-xl bg-[#22C55E] text-black cursor-pointer"
          onClick={() => removeTag(i)}
          style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase" }}>
          {tags[answer[i]]}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11 3L3 11M3 3L11 11" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Подсказка */}
      <p className="text-black" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "17px", textTransform: "uppercase" }}>
        {question.hint || "Перетащите названия частиц к их характеристикам"}
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

      {/* Теги в зелёной полоске */}
      <div className="w-full rounded-xl p-6 min-h-[79px] flex flex-wrap justify-center items-center gap-3"
        style={{ background: "#D4F9E1" }}>
        {tags.map((tag, i) => (
          !placedIndices.includes(i) && (
            <button key={i} type="button" draggable
              onDragStart={() => setDraggedTag(i)}
              onDragEnd={() => setDraggedTag(null)}
              onClick={() => placeTag(i)}
              className="px-6 py-1.5 rounded-xl cursor-pointer"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase", background: "#22C55E", color: "#222222" }}>
              {tag}
            </button>
          )
        ))}
      </div>
    </div>
  );
}
