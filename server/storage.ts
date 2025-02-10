import { videos, type Video, type InsertVideo } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getAllVideos(): Promise<Video[]>;
  searchVideos(query: string): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
}

export class DatabaseStorage implements IStorage {
  async getAllVideos(): Promise<Video[]> {
    return await db.select().from(videos);
  }

  async searchVideos(query: string): Promise<Video[]> {
    const lowercaseQuery = query.toLowerCase();
    const allVideos = await this.getAllVideos();
    return allVideos.filter(video =>
      video.title.toLowerCase().includes(lowercaseQuery) ||
      video.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getVideo(id: number): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db
      .insert(videos)
      .values(video)
      .returning();
    return newVideo;
  }
}

// Initialize with sample videos
async function initializeSampleVideos() {
  const sampleVideos: InsertVideo[] = [
    {
      title: "Beautiful Mountain Sunrise",
      description: "Stunning timelapse of sunrise over mountains",
      thumbnail: "https://images.unsplash.com/photo-1682686581854-5e71f58e7e3f",
      videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
    },
    {
      title: "Ocean Waves",
      description: "Relaxing ocean waves on a tropical beach",
      thumbnail: "https://images.unsplash.com/photo-1682686580950-960d1d513532",
      videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4"
    }
  ];

  for (const video of sampleVideos) {
    const existingVideos = await storage.getAllVideos();
    if (existingVideos.length === 0) {
      await storage.createVideo(video);
    }
  }
}

export const storage = new DatabaseStorage();
initializeSampleVideos().catch(console.error);