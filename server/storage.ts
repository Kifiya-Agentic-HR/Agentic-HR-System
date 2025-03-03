import { users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getHRUsers(): Promise<User[]>;
  createJob(job: any): Promise<any>;
  getJobsByHR(hrId: number): Promise<any[]>;
  getApplicationsByJob(jobId: number): Promise<any[]>;
  updatePrompt(prompt: string): Promise<string>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobs: Map<number, any>;
  private applications: Map<number, any>;
  private prompt: string;
  public sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.applications = new Map();
    this.prompt = "";
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user = { id, ...insertUser };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  async getHRUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === 'HR');
  }

  async createJob(job: any): Promise<any> {
    const id = this.currentId++;
    const newJob = { id, ...job };
    this.jobs.set(id, newJob);
    return newJob;
  }

  async getJobsByHR(hrId: number): Promise<any[]> {
    return Array.from(this.jobs.values()).filter(job => job.hrId === hrId);
  }

  async getApplicationsByJob(jobId: number): Promise<any[]> {
    return Array.from(this.applications.values()).filter(app => app.jobId === jobId);
  }

  async updatePrompt(prompt: string): Promise<string> {
    this.prompt = prompt;
    return this.prompt;
  }
}

export const storage = new MemStorage();