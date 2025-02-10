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
        title: "Forest Adventure",
        description: "Journey through a mystical forest",
        thumbnail: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba",
        videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
      },
      {
        title: "Desert Sunset",
        description: "Beautiful sunset over sand dunes",
        thumbnail: "https://images.unsplash.com/photo-1682687221323-6ce2dbc803ab",
        videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4"
      },
      {
        title: "Urban Explorer",
        description: "City life and architecture",
        thumbnail: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538",
        videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
      },
      {
        title: "Mountain Stream",
        description: "Peaceful mountain stream in nature",
        thumbnail: "https://images.unsplash.com/photo-1682687220198-88e9bdea9931",
        videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4"
      },
      {
        title: "Autumn Colors",
        description: "Fall foliage in its peak",
        thumbnail: "https://images.unsplash.com/photo-1682687219356-e820ca126c92",
        videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
      },
      {
        title: "Wildlife Safari",
        description: "Animals in their natural habitat",
        thumbnail: "https://images.unsplash.com/photo-1682687220015-166262460a53",
        videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4"
      },
      {
        title: "Northern Lights",
        description: "Aurora Borealis in the night sky",
        thumbnail: "https://images.unsplash.com/photo-1682687220509-61b8a906ca19",
        videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
      },
      {
        title: "Coastal Journey",
        description: "Exploring rocky coastlines",
        thumbnail: "https://images.unsplash.com/photo-1682687220923-c58b9a4592ae",
        videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4"
      },
      {
        title: "Spring Bloom",
        description: "Flowers blooming in spring",
        thumbnail: "https://images.unsplash.com/photo-1682687220247-9f786e34d472",
        videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
      },
      {
        title: "Starry Night",
        description: "Time-lapse of the night sky",
        thumbnail: "https://images.unsplash.com/photo-1682687220067-469c76a971aa",
        videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4"
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