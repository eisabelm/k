import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  url: string;
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!videoRef.current) return;

    playerRef.current = videojs(videoRef.current, {
      controls: true,
      fluid: true,
      preload: "auto",
      responsive: true,
      sources: [{
        src: url,
        type: 'video/mp4'
      }]
    }, function onPlayerReady() {
      console.log('Player is ready');
    });

    playerRef.current.on('error', function() {
      const error = playerRef.current.error();
      setError(`Error loading video: ${error && error.message}`);
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [url]);

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div data-vjs-player>
      <video
        ref={videoRef as any}
        className="video-js vjs-big-play-centered vjs-theme-city"
      />
    </div>
  );
}