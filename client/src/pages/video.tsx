import { useQuery } from "@tanstack/react-query";
import VideoPlayer from "@/components/video-player";
import { Skeleton } from "@/components/ui/skeleton";
import type { Video } from "@shared/schema";

interface VideoPageProps {
  params: {
    id: string;
  };
}

export default function VideoPage({ params }: VideoPageProps) {
  const { data: video, isLoading } = useQuery<Video>({
    queryKey: [`/api/videos/${params.id}`],
  });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="w-full aspect-video rounded-lg" />
        <Skeleton className="h-8 w-3/4 mt-6" />
        <Skeleton className="h-4 w-1/2 mt-4" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Video not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <VideoPlayer url={video.videoUrl} />
      <div className="mt-6">
        <h1 className="text-2xl font-semibold mb-2">{video.title}</h1>
        <p className="text-muted-foreground mb-4">
          {video.views.toLocaleString()} views
        </p>
        <p className="text-muted-foreground">{video.description}</p>
      </div>
    </div>
  );
}
