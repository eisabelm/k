import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export function registerRoutes(app: Express): Server {
  // Get all videos or search by query
  app.get("/api/videos", async (req, res) => {
    const { search } = req.query;
    const videos = search 
      ? await storage.searchVideos(search as string)
      : await storage.getAllVideos();
    res.json(videos);
  });

  // Get single video by ID
  app.get("/api/videos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const video = await storage.getVideo(id);
    
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    res.json(video);
  });

  const httpServer = createServer(app);
  return httpServer;
}
