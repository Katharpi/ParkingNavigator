import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getSession, isAuthenticated } from "./auth";
import { insertParkingSpaceSchema, updateParkingSpaceSchema, loginSchema, registerSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(getSession());

  // Initialize parking spaces on startup
  await storage.initializeParkingSpaces();

  // Initialize a default admin user
  const existingUser = await storage.getUserByUsername("admin");
  if (!existingUser) {
    await storage.createUser({
      username: "admin",
      password: "admin123",
      email: "admin@parking.com",
      firstName: "Admin",
      lastName: "User"
    });
  }

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.loginUser(credentials);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      (req.session as any).userId = user.id;
      res.json({ message: "Login successful", user: { id: user.id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      (req.session as any).userId = user.id;
      res.json({ message: "Registration successful", user: { id: user.id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logout successful" });
    });
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
      const userId = (req.session as any).userId;
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
      const userId = (req.session as any).userId;
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
