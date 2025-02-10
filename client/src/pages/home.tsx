import { useQuery } from "@tanstack/react-query";
import VideoGrid from "@/components/video-grid";
import { Skeleton } from "@/components/ui/skeleton";
import type { Video } from "@shared/schema";
import { useLocation } from "wouter";

export default function Home() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const searchQuery = searchParams.get("search");

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos", searchQuery],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="w-full aspect-video rounded-lg" />
            <Skeleton className="h-4 w-3/4 mt-4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (!videos?.length) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">No videos found</h2>
        <p className="text-muted-foreground">
          {searchQuery ? "Try a different search term" : "Check back later for new content"}
        </p>
      </div>
    );
  }

  return <VideoGrid videos={videos} />;
}
