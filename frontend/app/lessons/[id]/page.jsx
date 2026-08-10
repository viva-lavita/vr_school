"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Loader from "@/shared/components/Loader/Loader";
import { logoutUser } from "@/shared/api/auth";
import { useUser } from "@/shared/context/UserContext";
import { getLesson } from "@/shared/api/lessons";
import TestTab from "./components/TestTab";

export default function LessonPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useUser();
  const [lesson, setLesson] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(true);
  const [activeTab, setActiveTab] = useState("materials");
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoadingLesson(true);
    getLesson(id).then((data) => {
      setLesson(data);
      setLoadingLesson(false);
    });
  }, [id]);

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

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
      <h1 className="text-black uppercase pb-3 lesson-title break-words"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
        }}
      >
        {lesson.name}
      </h1>

      {/* Short description */}
      <p
        className="text-black pb-6 break-words"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          fontSize: "16px",
          lineHeight: "140%",
        }}
      >
        {lesson.description}
      </p>

      {/* Tabs — vertical on mobile, horizontal on desktop */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <button
          type="button"
          onClick={() => setActiveTab("materials")}
          className="flex-1 flex justify-center items-center px-6 py-3 rounded-full border-2 border-[#22C55E] cursor-pointer transition-colors"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "clamp(14px, 1vw + 6px, 16px)",
            lineHeight: "clamp(17px, 1.2vw + 7px, 19px)",
            textTransform: "uppercase",
            background: activeTab === "materials" ? "#D4F9E1" : "#FEFEFE",
            color: "#222222",
          }}
        >
          Материалы урока
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("test")}
          className="flex-1 flex justify-center items-center px-6 py-3 rounded-full border-2 border-[#22C55E] cursor-pointer transition-colors"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "clamp(14px, 1vw + 6px, 16px)",
            lineHeight: "clamp(17px, 1.2vw + 7px, 19px)",
            textTransform: "uppercase",
            background: activeTab === "test" ? "#D4F9E1" : "#FEFEFE",
            color: "#222222",
          }}
        >
          Проверочная работа
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "materials" ? (
        <div className="flex flex-col gap-10 mb-20">
          {/* Detailed text */}
          {lesson.sub_description && (
            <p
              className="text-black whitespace-pre-line break-words"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "140%",
              }}
            >
              {lesson.sub_description}
            </p>
          )}

          {/* VPN notice */}
          {lesson.is_need_vpn && (
            <p
              className="text-[#DB0000]"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "20px",
                lineHeight: "140%",
              }}
            >
              ! Для просмотра необходимо использовать VPN
            </p>
          )}

          {/* Video — responsive: 788px (1920), 530px (1024), 410px (768), 180px (360) */}
          {lesson.video && (
            <div className="relative w-full rounded-[26px] md:rounded-[32px] overflow-hidden bg-black xl:h-[788px] lg:h-[530px] md:h-[410px] h-[180px]">
              <iframe
                src={lesson.video}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={lesson.name}
              />
              {!videoPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                  onClick={() => setVideoPlaying(true)}
                >
                  <div className="xl:w-[120px] xl:h-[120px] lg:w-[100px] lg:h-[100px] w-[60px] h-[60px] rounded-full bg-[#FFB62F] flex items-center justify-center opacity-80">
                    <svg width="32" height="38" viewBox="0 0 32 38" fill="none">
                      <path d="M30 16.268C31.3339 17.0378 31.3339 18.9622 30 19.732L4 35.3205C2.66607 36.0903 1 35.1281 1 33.5885L1 2.41154C1 0.871933 2.66607 -0.0902537 4 0.679497L30 16.268Z" fill="white" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Link to test */}
          <button
            type="button"
            onClick={() => setActiveTab("test")}
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
            Перейти к проверочному заданию
          </button>
        </div>
      ) : (
        <TestTab lesson={lesson} user={user} onBackToMaterials={() => setActiveTab("materials")} />
      )}
    </div>
  );
}
