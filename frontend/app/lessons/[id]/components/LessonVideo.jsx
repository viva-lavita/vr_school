"use client";

import { useEffect, useMemo, useRef, useState } from "react";

let youtubeApiPromise;

function getYouTubeSource(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    let videoId = null;

    if (host === "youtu.be") {
      videoId = parsed.pathname.split("/").filter(Boolean)[0];
    } else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (parsed.pathname === "/watch") videoId = parsed.searchParams.get("v");
      else if (parsed.pathname.startsWith("/embed/") || parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.split("/").filter(Boolean)[1];
      }
    }

    if (!videoId || !/^[\w-]{6,}$/.test(videoId)) return null;

    const start = parsed.searchParams.get("start") || parsed.searchParams.get("t");
    return {
      videoId,
      start: start && /^\d+$/.test(start) ? start : null,
    };
  } catch {
    return null;
  }
}

function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.reject(new Error("YouTube API доступен только в браузере"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve, reject) => {
    let settled = false;
    let checkTimer = null;
    let timeoutTimer = null;
    let script = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    const shouldAppendScript = !script;

    if (!script) {
      script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
    }

    const finish = (error) => {
      if (settled) return;
      settled = true;
      window.clearInterval(checkTimer);
      window.clearTimeout(timeoutTimer);
      script.removeEventListener("error", handleError);

      if (error) reject(error);
      else resolve(window.YT);
    };

    const checkApi = () => {
      if (window.YT?.Player) finish();
    };

    const handleError = () => finish(new Error("Не удалось загрузить YouTube IFrame API"));
    script.addEventListener("error", handleError, { once: true });

    checkTimer = window.setInterval(checkApi, 100);
    timeoutTimer = window.setTimeout(
      () => finish(new Error("Превышено время ожидания YouTube IFrame API")),
      10000,
    );
    if (shouldAppendScript) document.head.appendChild(script);
    checkApi();
  }).catch((error) => {
    youtubeApiPromise = undefined;
    throw error;
  });

  return youtubeApiPromise;
}

function isDirectVideoUrl(url) {
  try {
    return /\.(mp4|webm|ogv|ogg)$/i.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

function Video360Player({ src, title }) {
  const containerRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let viewer = null;
    let cancelled = false;

    async function createViewer() {
      try {
        const [{ Viewer }, { EquirectangularVideoAdapter }, { VideoPlugin }] = await Promise.all([
          import("@photo-sphere-viewer/core"),
          import("@photo-sphere-viewer/equirectangular-video-adapter"),
          import("@photo-sphere-viewer/video-plugin"),
        ]);

        if (cancelled || !containerRef.current) return;

        viewer = new Viewer({
          container: containerRef.current,
          adapter: EquirectangularVideoAdapter.withConfig({
            autoplay: false,
            muted: false,
            shader: true,
          }),
          panorama: { source: src },
          plugins: [VideoPlugin],
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    createViewer();
    return () => {
      cancelled = true;
      viewer?.destroy();
    };
  }, [src]);

  if (failed) {
    return <video src={src} className="h-full w-full bg-black" controls playsInline aria-label={title} />;
  }

  return <div ref={containerRef} className="h-full w-full" aria-label={`${title}, видео 360°`} />;
}

function YouTubePlayer({ videoId, start, title }) {
  const wrapperRef = useRef(null);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const dragRef = useRef(null);
  const [isSpherical, setIsSpherical] = useState(false);
  const [rotationEnabled, setRotationEnabled] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const embedUrl = useMemo(() => {
    const url = new URL(`https://www.youtube.com/embed/${videoId}`);
    url.searchParams.set("enablejsapi", "1");
    url.searchParams.set("playsinline", "1");
    url.searchParams.set("fs", "0");
    if (start) url.searchParams.set("start", start);
    return url.toString();
  }, [start, videoId]);

  useEffect(() => {
    let cancelled = false;
    let checkTimer = null;
    let stopCheckingTimer = null;

    const stopChecking = () => {
      if (checkTimer) window.clearInterval(checkTimer);
      if (stopCheckingTimer) window.clearTimeout(stopCheckingTimer);
      checkTimer = null;
      stopCheckingTimer = null;
    };

    const checkSpherical = (player) => {
      try {
        const properties = player.getSphericalProperties?.() || {};
        const spherical = ["yaw", "pitch", "roll", "fov"].some((key) => Number.isFinite(properties[key]));
        if (spherical && !cancelled) {
          setIsSpherical(true);
          stopChecking();
        }
      } catch {
        // YouTube может отдать метаданные 360 только после начала воспроизведения.
      }
    };

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !iframeRef.current) return;

        const player = new YT.Player(iframeRef.current, {
          events: {
            onReady: ({ target }) => {
              checkSpherical(target);
              checkTimer = window.setInterval(() => checkSpherical(target), 1000);
              stopCheckingTimer = window.setTimeout(stopChecking, 15000);
            },
            onStateChange: ({ target }) => checkSpherical(target),
          },
        });
        playerRef.current = player;
      })
      .catch(() => {
        // Обычный iframe уже отображается и продолжает работать без API.
      });

    return () => {
      cancelled = true;
      stopChecking();
      dragRef.current = null;
      try {
        playerRef.current?.destroy?.();
      } catch {
        // iframe мог быть удалён React раньше завершения внешнего API.
      }
      playerRef.current = null;
    };
  }, [videoId]);

  useEffect(() => {
    const updateFullscreenState = () => {
      const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
      setIsFullscreen(fullscreenElement === wrapperRef.current);
    };

    const wrapper = wrapperRef.current;
    setFullscreenSupported(Boolean(
      document.fullscreenEnabled
      || document.webkitFullscreenEnabled
      || wrapper?.requestFullscreen
      || wrapper?.webkitRequestFullscreen,
    ));

    document.addEventListener("fullscreenchange", updateFullscreenState);
    document.addEventListener("webkitfullscreenchange", updateFullscreenState);
    return () => {
      document.removeEventListener("fullscreenchange", updateFullscreenState);
      document.removeEventListener("webkitfullscreenchange", updateFullscreenState);
    };
  }, []);

  const handlePointerDown = (event) => {
    const properties = playerRef.current?.getSphericalProperties?.();
    if (!properties || !Number.isFinite(properties.yaw)) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      yaw: properties.yaw,
      pitch: properties.pitch,
      moved: false,
    };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.moved ||= Math.abs(dx) + Math.abs(dy) > 4;
    playerRef.current?.setSphericalProperties?.({
      yaw: drag.yaw - dx * 0.2,
      pitch: Math.max(-90, Math.min(90, drag.pitch + dy * 0.2)),
      enableOrientationSensor: false,
    });
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag?.moved) {
      const player = playerRef.current;
      const playing = player?.getPlayerState?.() === window.YT?.PlayerState?.PLAYING;
      if (playing) player.pauseVideo?.();
      else player?.playVideo?.();
    }
  };

  const handleWheel = (event) => {
    const player = playerRef.current;
    const properties = player?.getSphericalProperties?.();
    if (!properties || !Number.isFinite(properties.fov)) return;
    event.preventDefault();
    player.setSphericalProperties({
      fov: Math.max(30, Math.min(120, properties.fov + event.deltaY * 0.05)),
    });
  };

  const toggleInteractionMode = () => {
    if (rotationEnabled) playerRef.current?.pauseVideo?.();
    setRotationEnabled((enabled) => !enabled);
  };

  const toggleFullscreen = async () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else document.webkitExitFullscreen?.();
      } else if (wrapper.requestFullscreen) {
        await wrapper.requestFullscreen();
      } else {
        wrapper.webkitRequestFullscreen?.();
      }
    } catch {
      // Браузер может запретить fullscreen вне пользовательского действия.
    }
  };

  return (
    <div ref={wrapperRef} className="relative h-full w-full bg-black">
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        title={title}
      />
      {isSpherical && (
        <>
          {rotationEnabled && (
            <div
              className="absolute inset-x-0 top-[64px] bottom-[88px] z-10 cursor-grab touch-none active:cursor-grabbing md:bottom-[104px]"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => { dragRef.current = null; }}
              onWheel={handleWheel}
              aria-label="Управление обзором видео 360 градусов"
            />
          )}
          <button
            type="button"
            onClick={toggleInteractionMode}
            className="absolute left-4 top-[72px] z-20 inline-flex items-center gap-2 rounded-full border-2 border-white bg-[#FFB62F] px-4 py-2 text-sm font-extrabold uppercase text-[#222222] shadow-[0_4px_18px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80"
            aria-pressed={rotationEnabled}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#222222] text-xs text-white">
              360°
            </span>
            {rotationEnabled ? "Открыть настройки видео" : "Включить обзор 360°"}
          </button>
        </>
      )}
      {fullscreenSupported && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute left-4 top-[132px] z-20 rounded-full border-2 border-white bg-[#222222]/90 px-4 py-2 text-sm font-bold text-white shadow-[0_4px_18px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB62F]/80"
          aria-label={isFullscreen ? "Выйти из полноэкранного режима" : "Открыть видео на весь экран"}
        >
          {isFullscreen ? "Выйти из полного экрана" : "На весь экран"}
        </button>
      )}
    </div>
  );
}

export default function LessonVideo({ src, title, is360 = false }) {
  const source = useMemo(() => {
    const youtubeSource = getYouTubeSource(src);
    if (youtubeSource) return { kind: "youtube", ...youtubeSource };
    if (is360) return { kind: "360", url: src };
    if (isDirectVideoUrl(src)) return { kind: "video", url: src };
    return { kind: "embed", url: src };
  }, [is360, src]);

  if (source.kind === "youtube") {
    return <YouTubePlayer videoId={source.videoId} start={source.start} title={title} />;
  }

  if (source.kind === "360") {
    return <Video360Player src={source.url} title={title} />;
  }

  if (source.kind === "video") {
    return <video src={source.url} className="h-full w-full bg-black" controls playsInline aria-label={title} />;
  }

  return (
    <iframe
      src={source.url}
      className="h-full w-full border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      title={title}
    />
  );
}
