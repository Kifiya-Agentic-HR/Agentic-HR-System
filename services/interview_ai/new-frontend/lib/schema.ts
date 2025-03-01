import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  status: text("status").notNull().default("pending"),
  chatHistory: jsonb("chat_history").notNull().default([]),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertUserSchema = createInsertSchema(users);
export const insertInterviewSchema = createInsertSchema(interviews);

export type User = typeof users.$inferSelect;
export type Interview = typeof interviews.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};
