"use client";

import TestCard from "./TestCard";

export default function TestTab({ lesson, onBackToMaterials }) {
  const comment = lesson.test_comment;
  const tests = lesson.tests || [];

  return (
    <div className="flex flex-col gap-10 mb-20">
      {/* Comment block */}
      {comment && (
        <div
          className="w-full rounded-[32px] px-6 py-8 md:px-[60px] md:py-[67px]"
          style={{ background: "#D4F9E1" }}
        >
          <p
            className="text-[#DB0000] pb-4"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "19px",
              textTransform: "uppercase",
            }}
          >
            ! Комментарий к проверочному заданию:
          </p>
          <p
            className="text-black whitespace-pre-line"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "16px",
              lineHeight: "140%",
            }}
          >
            {comment}
          </p>
        </div>
      )}

      {/* Test cards */}
      {tests.length > 0 ? (
        tests.map((test) => (
          <TestCard key={test.id} test={test} onBackToMaterials={onBackToMaterials} />
        ))
      ) : (
        <p className="text-2 text-dark">Проверочная работа пока не добавлена</p>
      )}

      {/* Link back to materials */}
      <button
        type="button"
        onClick={onBackToMaterials}
        className="self-start underline cursor-pointer"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 700,
          fontSize: "16px",
          lineHeight: "19px",
          textTransform: "uppercase",
          color: "#222222",
        }}
      >
        Вернуться к материалам урока
      </button>
    </div>
  );
}
