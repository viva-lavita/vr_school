"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Loader from "@/shared/components/Loader/Loader";
import { logoutUser } from "@/shared/api/auth";
import { useUser } from "@/shared/context/UserContext";
import { ITEMS_PER_PAGE, getSubjects, getLessons } from "@/shared/api/lessons";
import LessonCard from "./components/LessonCard";
import SubjectTabs from "./components/SubjectTabs";
import Pagination from "./components/Pagination";

export default function LessonsPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [lessonsError, setLessonsError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [subjectsError, setSubjectsError] = useState("");
  const [subjectsRetryCount, setSubjectsRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadingLessons(true);
    setSubjectsError("");
    getSubjects()
      .then((data) => {
        if (cancelled) return;
        setSubjects(data);
        if (data.length > 0) setActiveSubject(data[0].id);
        else {
          setSubjectsError("Нет доступных предметов.");
          setLoadingLessons(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setSubjectsError("Не удалось загрузить предметы.");
        setLoadingLessons(false);
      });
    return () => {
      cancelled = true;
    };
  }, [subjectsRetryCount]);

  useEffect(() => {
    if (activeSubject === null) return;
    let cancelled = false;
    setLoadingLessons(true);
    setLessonsError(false);
    getLessons({ subject: activeSubject, page: currentPage })
      .then((data) => {
        if (cancelled) return;
        setLessons(data.results);
        setTotalPages(data.total_pages);
      })
      .catch(() => {
        if (!cancelled) setLessonsError(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingLessons(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeSubject, currentPage, retryCount]);

  const handleSubjectChange = (subjectId) => {
    setCurrentPage(1);
    setActiveSubject(subjectId);
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={86} />
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* Title */}
      <h1
        className="text-black uppercase pt-[38px] pb-4"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "clamp(22px, 2.5vw + 8px, 32px)",
          lineHeight: "clamp(26px, 2.97vw + 8px, 38px)",
        }}
      >
        Каталог уроков
      </h1>

      {/* Logout */}
      <div className="flex justify-end pb-6">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 cursor-pointer"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "clamp(14px, 1vw + 6px, 16px)",
            lineHeight: "140%",
            color: "#222222",
          }}
        >
          <img src="/icons/ui/exit.svg" alt="" className="w-[16px] h-[15px]" />
          Выйти из профиля
        </button>
      </div>

      {/* Tabs */}
      <SubjectTabs
        subjects={subjects}
        active={activeSubject}
        onChange={handleSubjectChange}
      />

      {/* Green container with cards */}
      <div
        className="mt-[28px] rounded-[32px] px-5 py-5 md:px-[40px] md:py-[40px] lg:px-[60px] lg:py-[60px] mb-[80px] lg:mb-[120px]"
        style={{ background: "#D4F9E1" }}
      >
        {loadingLessons ? (
          <div className="flex justify-center py-20">
            <Loader size={60} />
          </div>
        ) : subjectsError || lessonsError ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <p>{subjectsError || "Не удалось загрузить уроки."}</p>
            <button
              type="button"
              onClick={() => subjectsError
                ? setSubjectsRetryCount((count) => count + 1)
                : setRetryCount((count) => count + 1)}
              className="underline cursor-pointer"
            >
              Повторить
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mx-auto w-full max-w-[288px] md:max-w-none md:mx-0 overflow-hidden">
            {lessons.map((lesson, index) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                number={(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
              />
            ))}
          </div>
        )}

        {!subjectsError && !lessonsError && totalPages > 1 && (
          <Pagination
            current={currentPage}
            total={totalPages}
            onChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
