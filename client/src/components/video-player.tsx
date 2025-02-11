import { useEffect, useRef } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";

interface VideoPlayerProps {
  url: string;
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player>();

  useEffect(() => {
    // Check if we have video element
    if (!videoRef.current) {
      return;
    }

    // Initialize player if it hasn't been initialized
    if (!playerRef.current) {
      const videoElement = videoRef.current;

      playerRef.current = videojs(videoElement, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
        responsive: true,
        playbackRates: [0.5, 1, 1.5, 2],
        sources: [{
          src: url,
          type: 'video/mp4'
        }]
      });

      // Log when player is ready
      playerRef.current.ready(() => {
        console.log('Player is ready');
      });
    } else {
      // If player exists, update the source
      playerRef.current.src({
        src: url,
        type: 'video/mp4'
      });
    }

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = undefined;
      }
    };
  }, [url]);

  return (
    <div data-vjs-player className="w-full">
      <video 
        ref={videoRef}
        className="video-js vjs-big-play-centered vjs-fluid"
      />
    </div>
  );
}