import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  url: string;
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize VideoJS player
    const player = videojs(videoRef.current, {
      controls: true,
      fluid: true,
      autoplay: false,
      preload: "auto",
      sources: [{
        src: url,
        type: 'video/mp4'
      }]
    }, function onPlayerReady() {
      console.log('Player is ready');
    });

    playerRef.current = player;

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [url]);

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered vjs-theme-city"
      />
    </div>
  );
}