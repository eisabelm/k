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
    if (!videoRef.current) return;

    const options = {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      sources: [{
        src: url,
        type: 'video/mp4'
      }]
    };

    const player = videojs(videoRef.current, options);
    playerRef.current = player;

    player.ready(() => {
      console.log('Player is ready');
      player.src({ src: url, type: 'video/mp4' });
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [url]);

  return (
    <div data-vjs-player>
      <video 
        ref={videoRef}
        className="video-js vjs-big-play-centered"
      />
    </div>
  );
}