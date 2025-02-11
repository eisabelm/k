import { useEffect, useRef } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";

interface VideoPlayerProps {
  url: string;
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize player
    const options = {
      controls: true,
      fluid: true,
      preload: 'auto',
      html5: {
        vhs: {
          overrideNative: true
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false
      },
      sources: [{
        src: url,
        type: 'video/mp4'
      }]
    };

    const player = videojs(videoRef.current, options);
    playerRef.current = player;

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [url]);

  return (
    <div className="aspect-video">
      <video 
        ref={videoRef}
        className="video-js vjs-big-play-centered w-full h-full"
      />
    </div>
  );
}