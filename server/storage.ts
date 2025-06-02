import {
  users,
  parkingSpaces,
  parkingHistory,
  type User,
  type InsertUser,
  type ParkingSpace,
  type InsertParkingSpace,
  type UpdateParkingSpace,
  type ParkingHistory,
  type LoginRequest,
  type RegisterRequest,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  loginUser(credentials: LoginRequest): Promise<User | null>;
  
  // Parking space operations
  getAllParkingSpaces(): Promise<ParkingSpace[]>;
  getParkingSpace(id: number): Promise<ParkingSpace | undefined>;
  createParkingSpace(space: InsertParkingSpace): Promise<ParkingSpace>;
  updateParkingSpace(id: number, updates: UpdateParkingSpace): Promise<ParkingSpace>;
  
  // Parking statistics
  getParkingStats(): Promise<{
    total: number;
    available: number;
    occupied: number;
    maintenance: number;
    occupancyRate: number;
  }>;
  
  // Parking history
  addParkingHistory(spaceId: number, action: string, userId?: number): Promise<ParkingHistory>;
  getRecentHistory(limit?: number): Promise<ParkingHistory[]>;
  
  // Initialize default parking spaces
  initializeParkingSpaces(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async loginUser(credentials: LoginRequest): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, credentials.username));
    
    if (!user || user.password !== credentials.password) {
      return null;
    }
    
    return user;
  }

  // Parking space operations
  async getAllParkingSpaces(): Promise<ParkingSpace[]> {
    return await db.select().from(parkingSpaces).orderBy(parkingSpaces.section, parkingSpaces.spaceNumber);
  }

  async getParkingSpace(id: number): Promise<ParkingSpace | undefined> {
    const [space] = await db.select().from(parkingSpaces).where(eq(parkingSpaces.id, id));
    return space;
  }

  async createParkingSpace(space: InsertParkingSpace): Promise<ParkingSpace> {
    const [newSpace] = await db
      .insert(parkingSpaces)
      .values(space)
      .returning();
    return newSpace;
  }

  async updateParkingSpace(id: number, updates: UpdateParkingSpace): Promise<ParkingSpace> {
    const [updatedSpace] = await db
      .update(parkingSpaces)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(parkingSpaces.id, id))
      .returning();
    return updatedSpace;
  }

  async getParkingStats(): Promise<{
    total: number;
    available: number;
    occupied: number;
    maintenance: number;
    occupancyRate: number;
  }> {
    const result = await db
      .select({
        status: parkingSpaces.status,
        count: count(),
      })
      .from(parkingSpaces)
      .groupBy(parkingSpaces.status);

    const stats = {
      total: 0,
      available: 0,
      occupied: 0,
      maintenance: 0,
      occupancyRate: 0,
    };

    result.forEach((row) => {
      const statusCount = Number(row.count);
      stats.total += statusCount;
      
      if (row.status === 'available') {
        stats.available = statusCount;
      } else if (row.status === 'occupied') {
        stats.occupied = statusCount;
      } else if (row.status === 'maintenance') {
        stats.maintenance = statusCount;
      }
    });

    stats.occupancyRate = stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0;
    
    return stats;
  }

  async addParkingHistory(spaceId: number, action: string, userId?: number): Promise<ParkingHistory> {
    const [history] = await db
      .insert(parkingHistory)
      .values({
        spaceId,
        action,
        userId: userId || 1, // Default user for now
      })
      .returning();
    return history;
  }

  async getRecentHistory(limit: number = 10): Promise<ParkingHistory[]> {
    return await db
      .select()
      .from(parkingHistory)
      .orderBy(desc(parkingHistory.timestamp))
      .limit(limit);
  }

  async initializeParkingSpaces(): Promise<void> {
    // Check if spaces already exist
    const existingSpaces = await db.select().from(parkingSpaces).limit(1);
    if (existingSpaces.length > 0) {
      return; // Already initialized
    }

    // Create default parking spaces
    const spacesToCreate: InsertParkingSpace[] = [];
    
    // Section A - 8 spaces
    for (let i = 1; i <= 8; i++) {
      spacesToCreate.push({
        spaceNumber: `A${i}`,
        section: 'A',
        status: i % 3 === 0 ? 'occupied' : 'available', // Some randomly occupied
      });
    }

    // Section B - 10 spaces
    for (let i = 1; i <= 10; i++) {
      spacesToCreate.push({
        spaceNumber: `B${i}`,
        section: 'B',
        status: i % 4 === 0 ? 'occupied' : 'available',
      });
    }

    // Section C - 12 spaces
    for (let i = 1; i <= 12; i++) {
      spacesToCreate.push({
        spaceNumber: `C${i}`,
        section: 'C',
        status: i % 5 === 0 ? 'occupied' : i === 8 ? 'maintenance' : 'available',
      });
    }

    await db.insert(parkingSpaces).values(spacesToCreate);
  }
}

export const storage = new DatabaseStorage();
