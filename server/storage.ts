import { videos, type Video, type InsertVideo } from "@shared/schema";

export interface IStorage {
  getAllVideos(): Promise<Video[]>;
  searchVideos(query: string): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
}

export class MemStorage implements IStorage {
  private videos: Map<number, Video>;
  private currentId: number;

  constructor() {
    this.videos = new Map();
    this.currentId = 1;
    this.initSampleVideos();
  }

  private initSampleVideos() {
    const sampleVideos: InsertVideo[] = [
      {
        title: "Beautiful Mountain Sunrise",
        description: "Stunning timelapse of sunrise over mountains",
        thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      },
      {
        title: "Ocean Waves",
        description: "Relaxing ocean waves on a tropical beach",
        thumbnail: "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
      },
      {
        title: "Desert Adventure",
        description: "Journey through the golden sands",
        thumbnail: "https://images.unsplash.com/photo-1509316785289-025f5b846b35",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
      }
    ];

    sampleVideos.forEach(video => this.createVideo(video));
  }

  async getAllVideos(): Promise<Video[]> {
    return Array.from(this.videos.values());
  }

  async searchVideos(query: string): Promise<Video[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.videos.values()).filter(video =>
      video.title.toLowerCase().includes(lowercaseQuery) ||
      video.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const id = this.currentId++;
    const newVideo: Video = {
      ...video,
      id,
      views: 0
    };
    this.videos.set(id, newVideo);
    return newVideo;
  }
}

export const storage = new MemStorage();