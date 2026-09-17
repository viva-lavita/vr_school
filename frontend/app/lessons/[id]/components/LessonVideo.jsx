"use client";

import { useEffect, useMemo, useRef, useState } from "react";

let youtubeApiPromise;

function getYouTubeVideoId(url) {
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
    return videoId;
  } catch {
    return null;
  }
}

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve(window.YT);
    };

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      youtubeApiPromise = undefined;
      reject(new Error("Не удалось загрузить YouTube IFrame API"));
    };
    document.head.appendChild(script);
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

function YouTubePlayer({ videoId, title }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const dragRef = useRef(null);
  const [isSpherical, setIsSpherical] = useState(false);
  const [rotationEnabled, setRotationEnabled] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let checkTimer = null;

    function checkSpherical(player) {
      try {
        const properties = player.getSphericalProperties?.() || {};
        const spherical = ["yaw", "pitch", "roll", "fov"].some((key) => Number.isFinite(properties[key]));
        if (!cancelled) setIsSpherical(spherical);
      } catch {
        // Metadata may not be ready until playback starts.
      }
    }

    async function createPlayer() {
      try {
        const YT = await loadYouTubeApi();
        if (cancelled || !containerRef.current) return;

        playerRef.current = new YT.Player(containerRef.current, {
          videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: ({ target }) => {
              checkSpherical(target);
              checkTimer = window.setInterval(() => checkSpherical(target), 1000);
            },
            onStateChange: ({ target }) => checkSpherical(target),
            onError: () => setFailed(true),
          },
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    createPlayer();
    return () => {
      cancelled = true;
      if (checkTimer) window.clearInterval(checkTimer);
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [videoId]);

  const handlePointerDown = (event) => {
    const player = playerRef.current;
    const properties = player?.getSphericalProperties?.();
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
    setRotationEnabled(!rotationEnabled);
  };

  if (failed) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        title={title}
      />
    );
  }

  return (
    <div className="relative h-full w-full bg-black">
      <div ref={containerRef} className="h-full w-full" />
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
    </div>
  );
}

export default function LessonVideo({ src, title, is360 = false }) {
  const source = useMemo(() => {
    const youtubeVideoId = getYouTubeVideoId(src);
    if (youtubeVideoId) return { kind: "youtube", videoId: youtubeVideoId };
    if (is360) return { kind: "360", url: src };
    if (isDirectVideoUrl(src)) return { kind: "video", url: src };
    return { kind: "embed", url: src };
  }, [is360, src]);

  if (source.kind === "youtube") {
    return <YouTubePlayer videoId={source.videoId} title={title} />;
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
