import { pgTable, text, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum('user_role', ['HR', 'ADMIN']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull(),
  name: text("name"),
  dateOfBirth: text("date_of_birth"),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  type: text("type").notNull(),
  commitment: text("commitment").notNull(),
  qualificationLevel: text("qualification_level").notNull(),
  skills: text("skills").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull().default('ONGOING'),
  hrId: integer("hr_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull(),
  name: text("name").notNull(),
  cvLink: text("cv_link").notNull(),
  appliedDate: timestamp("applied_date").notNull().defaultNow(),
  screeningStatus: text("screening_status").notNull().default('PENDING'),
  screeningReason: text("screening_reason"),
  interviewStatus: text("interview_status"),
  interviewReason: text("interview_reason"),
});

export const insertUserSchema = createInsertSchema(users, {
  role: z.enum(['HR', 'ADMIN']),
  name: z.string().nullish(),
  dateOfBirth: z.string().nullish(),
}).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  dateOfBirth: true,
});

export const insertJobSchema = createInsertSchema(jobs).pick({
  title: true,
  summary: true,
  type: true,
  commitment: true,
  qualificationLevel: true,
  skills: true,
  location: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Application = typeof applications.$inferSelect;