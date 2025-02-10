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
    },
    {
      title: "Desert Adventure",
      description: "Journey through the golden sands",
      thumbnail: "https://images.unsplash.com/photo-1682687220591-d13c2b4a6df7",
      videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
    },
    {
      title: "Forest Wildlife",
      description: "Discover the hidden life in forests",
      thumbnail: "https://images.unsplash.com/photo-1682687221248-3116ba6ab483",
      videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4"
    },
    {
      title: "City Lights",
      description: "Nighttime urban exploration",
      thumbnail: "https://images.unsplash.com/photo-1682686578842-00ba49b0a71a",
      videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
    },
    {
      title: "River Rapids",
      description: "Experience the thrill of white water",
      thumbnail: "https://images.unsplash.com/photo-1682687982029-edb9aecf5f89",
      videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4"
    },
    {
      title: "Northern Lights",
      description: "Aurora Borealis in full display",
      thumbnail: "https://images.unsplash.com/photo-1682688759157-57988e10ffa8",
      videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
    },
    {
      title: "Volcano Eruption",
      description: "Nature's raw power unleashed",
      thumbnail: "https://images.unsplash.com/photo-1682687218147-9806312792fa",
      videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4"
    },
    {
      title: "Underwater World",
      description: "Exploring coral reefs",
      thumbnail: "https://images.unsplash.com/photo-1682687220198-88e9bdea9931",
      videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
    },
    {
      title: "Snow Storm",
      description: "Winter's fury in action",
      thumbnail: "https://images.unsplash.com/photo-1682687221363-72518513620e",
      videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4"
    },
    {
      title: "Desert Sunset",
      description: "Golden hour in the Sahara",
      thumbnail: "https://images.unsplash.com/photo-1682686580186-b55d2a91053c",
      videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
    },
    {
      title: "Rainforest Life",
      description: "Biodiversity in action",
      thumbnail: "https://images.unsplash.com/photo-1682687220067-469c0f680156",
      videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4"
    }
  ];

  const existingVideos = await storage.getAllVideos();
  if (existingVideos.length === 0) {
    for (const video of sampleVideos) {
      await storage.createVideo(video);
    }
  }
}

export const storage = new DatabaseStorage();
initializeSampleVideos().catch(console.error);