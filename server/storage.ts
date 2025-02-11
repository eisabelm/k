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
      },
      {
        title: "Forest Wildlife",
        description: "Discover the hidden life in forests",
        thumbnail: "https://images.unsplash.com/photo-1448375240586-882707db888b",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
      },
      {
        title: "City Lights",
        description: "Nighttime urban exploration",
        thumbnail: "https://images.unsplash.com/photo-1519501025264-65ba15a82390",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
      },
      {
        title: "River Rapids",
        description: "Experience the thrill of white water",
        thumbnail: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
      },
      {
        title: "Northern Lights",
        description: "Aurora Borealis in full display",
        thumbnail: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4"
      },
      {
        title: "Volcano Eruption",
        description: "Nature's raw power unleashed",
        thumbnail: "https://images.unsplash.com/photo-1462332420958-a05d1e002413",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
      },
      {
        title: "Underwater World",
        description: "Exploring coral reefs",
        thumbnail: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4"
      },
      {
        title: "Snow Storm",
        description: "Winter's fury in action",
        thumbnail: "https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
      },
      {
        title: "Desert Sunset",
        description: "Golden hour in the Sahara",
        thumbnail: "https://images.unsplash.com/photo-1509074761163-a1defef7c10a",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4"
      },
      {
        title: "Rainforest Life",
        description: "Biodiversity in action",
        thumbnail: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
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