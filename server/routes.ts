import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertJobSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Job Routes
  app.post("/api/jobs", async (req, res) => {
    if (!req.user || req.user.role !== "HR") {
      return res.status(403).send("Only HR can post jobs");
    }

    try {
      const data = insertJobSchema.parse(req.body);
      const job = await storage.createJob({ ...data, hrId: req.user.id });
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ error: "Invalid job data" });
    }
  });

  app.get("/api/jobs", async (req, res) => {
    if (!req.user || req.user.role !== "HR") {
      return res.status(403).send("Only HR can view jobs");
    }
    const jobs = await storage.getJobsByHR(req.user.id);
    res.json(jobs);
  });

  app.get("/api/jobs/:id/applications", async (req, res) => {
    if (!req.user || req.user.role !== "HR") {
      return res.status(403).send("Only HR can view applications");
    }
    const applications = await storage.getApplicationsByJob(parseInt(req.params.id));
    res.json(applications);
  });

  // HR Management Routes (Admin only)
  app.get("/api/users/hr", async (req, res) => {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).send("Only admin can view HR accounts");
    }
    const hrUsers = await storage.getHRUsers();
    res.json(hrUsers);
  });

  app.post("/api/users/hr", async (req, res) => {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).send("Only admin can create HR accounts");
    }
    try {
      const user = await storage.createUser({
        ...req.body,
        role: "HR"
      });
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.delete("/api/users/hr/:id", async (req, res) => {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).send("Only admin can delete HR accounts");
    }
    await storage.deleteUser(parseInt(req.params.id));
    res.sendStatus(200);
  });

  // User Profile Routes
  app.patch("/api/user", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Authentication required");
    }

    const updateSchema = z.object({
      name: z.string().optional(),
      dateOfBirth: z.string().optional(),
    });

    try {
      const data = updateSchema.parse(req.body);
      const user = await storage.updateUser(req.user.id, data);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Admin Settings Routes
  app.patch("/api/settings/prompt", async (req, res) => {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).send("Only admin can update prompt");
    }
    try {
      const prompt = await storage.updatePrompt(req.body.prompt);
      res.json({ prompt });
    } catch (error) {
      res.status(400).json({ error: "Invalid prompt data" });
    }
  });

  // Statistics Route for Admin Dashboard
  app.get("/api/stats", async (req, res) => {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).send("Only admin can view statistics");
    }

    const stats = {
      genderStats: [
        { name: "Male", value: 60 },
        { name: "Female", value: 40 }
      ],
      screeningStats: [
        { name: "Passed", value: 75 },
        { name: "Failed", value: 25 }
      ],
      interviewStats: [
        { name: "Passed", value: 45 },
        { name: "Failed", value: 30 }
      ]
    };

    res.json(stats);
  });

  const httpServer = createServer(app);
  return httpServer;
}