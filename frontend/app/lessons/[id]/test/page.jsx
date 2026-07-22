"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Loader from "@/shared/components/Loader/Loader";
import { useUser } from "@/shared/context/UserContext";
import { getLesson } from "@/shared/api/lessons";

/**
 * Страница "Тест не завершён" — отдельный роут /lessons/[id]/test.
 * Показывает заглушку с иллюстрацией и кнопкой "Продолжить".
 */
export default function TestNotCompletedPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useUser();
  const [lesson, setLesson] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoadingLesson(true);
    getLesson(id).then((data) => {
      setLesson(data);
      setLoadingLesson(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={86} />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  if (loadingLesson) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={60} />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-2 text-dark">Урок не найден</p>
        <Link href="/lessons" className="text-2 text-[#343E3D] underline">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  const test = lesson.tests?.[0];

  const handleContinue = () => {
    router.push(`/lessons/${id}`);
  };

  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* Back link */}
      <Link
        href="/lessons"
        className="flex items-center gap-2 pt-[38px] pb-6 cursor-pointer"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "17px",
          color: "#343E3D",
        }}
      >
        <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
          <path d="M14 6H2M2 6L7 1M2 6L7 11" stroke="#343E3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Вернуться в каталог уроков
      </Link>

      {/* Title */}
      <h1 className="text-black uppercase pb-3 lesson-title"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
        }}
      >
        {lesson.name}
      </h1>

      {/* Short description */}
      <p
        className="text-black pb-6"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          fontSize: "16px",
          lineHeight: "140%",
        }}
      >
        {lesson.description}
      </p>

      {/* Tabs — column on mobile, row on desktop */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <Link
          href={`/lessons/${id}`}
          className="flex-1 flex justify-center items-center px-6 py-3 rounded-full border-2 border-[#22C55E] cursor-pointer transition-colors no-underline"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "14px",
            lineHeight: "17px",
            textTransform: "uppercase",
            background: "#FEFEFE",
            color: "#222222",
          }}
        >
          Материалы урока
        </Link>
        <div
          className="flex-1 flex justify-center items-center px-6 py-3 rounded-full border-2 border-[#22C55E] cursor-default"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "14px",
            lineHeight: "17px",
            textTransform: "uppercase",
            background: "#D4F9E1",
            color: "#222222",
          }}
        >
          Проверочная работа
        </div>
      </div>

      {/* Test comment */}
      {lesson.test_comment && (
        <div
          className="w-full rounded-[32px] px-4 py-4 md:px-[60px] md:py-[67px] mb-10"
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
            {lesson.test_comment}
          </p>
        </div>
      )}

      {/* Test card — not completed state */}
      <div
        className="w-full rounded-[32px] px-4 py-4 md:px-[30px] md:py-[30px] mb-10"
        style={{ background: "#D4F9E1" }}
      >
        {/* Header */}
        <div className="bg-white rounded-xl p-4 md:p-[16px] mb-4">
          <div className="flex flex-col gap-[15px] text-left">
            <p className="text-[#343E3D]" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase" }}>
              Задание
            </p>
            <p className="text-black" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "16px", lineHeight: "19px", textTransform: "uppercase" }}>
              Тема: «{test?.name || "Тест"}»
            </p>
            <span className="inline-flex self-start px-3 py-1 rounded-xl border border-[#DB0000] text-[#DB0000]"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "140%" }}>
              в работе
            </span>
          </div>
        </div>

        {/* Not completed content */}
        <div className="bg-white rounded-[26px] md:rounded-[32px] p-4 md:p-12 flex flex-col items-center gap-4 md:gap-6">
          <p className="text-black self-start" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", lineHeight: "17px", textTransform: "uppercase" }}>
            Тест еще не завершен
          </p>

          <div className="relative w-full max-w-[256px] md:max-w-[833px] h-[98px] md:h-[320px] rounded-xl md:rounded-[32px] overflow-hidden flex items-center justify-center">
            <img
              src="/images/test-not-completed.svg"
              alt="Тест не завершён"
              className="w-full h-full object-cover"
            />
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="w-full md:w-auto px-10 py-4 rounded-full cursor-pointer"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "19px",
              textTransform: "uppercase",
              background: "#FFB62F",
              color: "#222222",
            }}
          >
            Продолжить
          </button>
        </div>
      </div>

      {/* Back to materials link */}
      <Link
        href={`/lessons/${id}`}
        className="self-start underline cursor-pointer no-underline mb-20"
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
      </Link>
    </div>
  );
}
