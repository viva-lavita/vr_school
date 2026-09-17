"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function getYouTubeEmbedUrl(url) {
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

    const embed = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
    const start = parsed.searchParams.get("start") || parsed.searchParams.get("t");
    if (start && /^\d+$/.test(start)) embed.searchParams.set("start", start);
    return embed.toString();
  } catch {
    return null;
  }
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

export default function LessonVideo({ src, title, is360 = false }) {
  const source = useMemo(() => {
    const youtubeEmbedUrl = getYouTubeEmbedUrl(src);
    if (youtubeEmbedUrl) return { kind: "embed", url: youtubeEmbedUrl };
    if (is360) return { kind: "360", url: src };
    if (isDirectVideoUrl(src)) return { kind: "video", url: src };
    return { kind: "embed", url: src };
  }, [is360, src]);

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
