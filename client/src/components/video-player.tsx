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
    // Make sure video.js player is only initialized once
    if (!playerRef.current) {
      if (!videoRef.current) return;

      const videoElement = videoRef.current;
      const player = videojs(videoElement, {
        controls: true,
        fluid: true,
        responsive: true,
        sources: [{
          src: url,
          type: 'video/mp4'
        }]
      });

      player.ready(() => {
        console.log('Player is ready');
        // Load the video source after player is ready
        player.src({
          src: url,
          type: 'video/mp4'
        });
      });

      playerRef.current = player;
    } else {
      // If player exists, just update the source
      const player = playerRef.current;
      player.src({
        src: url,
        type: 'video/mp4'
      });
    }

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
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