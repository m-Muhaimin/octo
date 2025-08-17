import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  gender: text("gender").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  department: text("department").notNull(),
  patientId: text("patient_id").notNull().unique(),
  avatar: text("avatar"),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  patientName: text("patient_name").notNull(),
  appointmentType: text("appointment_type").notNull(),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  status: text("status").default("scheduled"),
});

export const metrics = pgTable("metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  totalPatients: integer("total_patients").notNull(),
  totalAppointments: integer("total_appointments").notNull(),
  totalIncome: decimal("total_income", { precision: 10, scale: 2 }).notNull(),
  totalTreatments: integer("total_treatments").notNull(),
  patientGrowth: text("patient_growth").notNull(),
  appointmentGrowth: text("appointment_growth").notNull(),
  incomeGrowth: text("income_growth").notNull(),
  treatmentGrowth: text("treatment_growth").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chartData = pgTable("chart_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  month: text("month").notNull(),
  hospitalizedPatients: integer("hospitalized_patients").notNull(),
  outpatients: integer("outpatients").notNull(),
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
});

export const insertMetricsSchema = createInsertSchema(metrics).omit({
  id: true,
  updatedAt: true,
});

export const insertChartDataSchema = createInsertSchema(chartData).omit({
  id: true,
});

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertMetrics = z.infer<typeof insertMetricsSchema>;
export type Metrics = typeof metrics.$inferSelect;
export type InsertChartData = z.infer<typeof insertChartDataSchema>;
export type ChartData = typeof chartData.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
