import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertParkingSpaceSchema, updateParkingSpaceSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize parking spaces on startup
  await storage.initializeParkingSpaces();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Parking spaces routes
  app.get("/api/parking/spaces", isAuthenticated, async (req, res) => {
    try {
      const spaces = await storage.getAllParkingSpaces();
      res.json(spaces);
    } catch (error) {
      console.error("Error fetching parking spaces:", error);
      res.status(500).json({ message: "Failed to fetch parking spaces" });
    }
  });

  app.get("/api/parking/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getParkingStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching parking stats:", error);
      res.status(500).json({ message: "Failed to fetch parking stats" });
    }
  });

  app.patch("/api/parking/spaces/:id", isAuthenticated, async (req: any, res) => {
    try {
      const spaceId = parseInt(req.params.id);
      if (isNaN(spaceId)) {
        return res.status(400).json({ message: "Invalid space ID" });
      }

      const updates = updateParkingSpaceSchema.parse(req.body);
      const updatedSpace = await storage.updateParkingSpace(spaceId, updates);
      
      // Log the action
      const userId = req.user.claims.sub;
      const action = updates.status === 'occupied' ? 'occupied' : 
                    updates.status === 'available' ? 'freed' : 'maintenance';
      await storage.addParkingHistory(spaceId, action, userId);

      res.json(updatedSpace);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error updating parking space:", error);
      res.status(500).json({ message: "Failed to update parking space" });
    }
  });

  app.post("/api/parking/spaces", isAuthenticated, async (req: any, res) => {
    try {
      const spaceData = insertParkingSpaceSchema.parse(req.body);
      const newSpace = await storage.createParkingSpace(spaceData);
      
      // Log the creation
      const userId = req.user.claims.sub;
      await storage.addParkingHistory(newSpace.id, 'created', userId);

      res.status(201).json(newSpace);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error creating parking space:", error);
      res.status(500).json({ message: "Failed to create parking space" });
    }
  });

  app.get("/api/parking/history", isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const history = await storage.getRecentHistory(limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching parking history:", error);
      res.status(500).json({ message: "Failed to fetch parking history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
