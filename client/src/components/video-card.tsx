import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Link } from "wouter";
import type { Video } from "@shared/schema";

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/video/${video.id}`}>
      <a className="block hover:opacity-80 transition-opacity">
        <Card>
          <CardContent className="p-0">
            <AspectRatio ratio={16/9}>
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="object-cover w-full h-full rounded-t-lg"
              />
            </AspectRatio>
            <div className="p-4">
              <h3 className="font-semibold line-clamp-2 mb-1">{video.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {video.views.toLocaleString()} views
              </p>
            </div>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
