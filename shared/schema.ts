import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, date, boolean, numeric, char } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patients = pgTable("patients", {
  patientId: integer("patient_id").primaryKey().generatedByDefaultAsIdentity(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  gender: char("gender", { length: 1 }),
  dateOfBirth: date("date_of_birth").notNull(),
  race: text("race"),
  ethnicity: text("ethnicity"),
  address: text("address"),
  city: text("city"),
  state: char("state", { length: 2 }),
  zipCode: char("zip_code", { length: 5 }),
  phone: text("phone"),
  email: text("email"),
  primaryLanguage: text("primary_language"),
  maritalStatus: text("marital_status"),
  insuranceType: text("insurance_type"),
  lastVisitDate: date("last_visit_date"),
});

export const appointments = pgTable("appointments", {
  appointmentId: integer("appointment_id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id").references(() => patients.patientId).notNull(),
  appointmentType: text("appointment_type").notNull(),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  status: text("status").default("scheduled"),
  encounterId: integer("encounter_id").references(() => encounters.encounterId),
  createdAt: timestamp("created_at").defaultNow(),
});

export const encounters = pgTable("encounters", {
  encounterId: integer("encounter_id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id").references(() => patients.patientId).notNull(),
  visitDate: date("visit_date").notNull(),
  provider: text("provider"),
  visitType: text("visit_type"),
  chiefComplaint: text("chief_complaint"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  followUpDate: date("follow_up_date"),
  notes: text("notes"),
});

export const metrics = pgTable("metrics", {
  metricId: integer("metric_id").primaryKey().generatedByDefaultAsIdentity(),
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
  chartId: integer("chart_id").primaryKey().generatedByDefaultAsIdentity(),
  month: text("month").notNull(),
  hospitalizedPatients: integer("hospitalized_patients").notNull(),
  outpatients: integer("outpatients").notNull(),
  chronicPatients: integer("chronic_patients"),
  preventiveVisits: integer("preventive_visits"),
  emergencyVisits: integer("emergency_visits"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  transactionId: integer("transaction_id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id").references(() => patients.patientId).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // payment, refund, charge
  status: text("status").notNull().default("pending"), // pending, completed, overdue, failed
  description: text("description"),
  paymentMethod: text("payment_method").notNull(), // cash, card, insurance, bank_transfer
  transactionDate: timestamp("transaction_date").defaultNow(),
  encounterId: integer("encounter_id").references(() => encounters.encounterId),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  patientId: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  appointmentId: true,
  createdAt: true,
});

export const insertMetricsSchema = createInsertSchema(metrics).omit({
  metricId: true,
  updatedAt: true,
});

export const insertChartDataSchema = createInsertSchema(chartData).omit({
  chartId: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  transactionId: true,
  createdAt: true,
}).extend({
  transactionDate: z.string().optional().transform((val) => val ? new Date(val) : new Date()),
});

export const insertEncounterSchema = createInsertSchema(encounters).omit({
  encounterId: true,
});

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertMetrics = z.infer<typeof insertMetricsSchema>;
export type Metrics = typeof metrics.$inferSelect;
export type InsertChartData = z.infer<typeof insertChartDataSchema>;
export type ChartData = typeof chartData.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertEncounter = z.infer<typeof insertEncounterSchema>;
export type Encounter = typeof encounters.$inferSelect;

export const users = pgTable("users", {
  userId: integer("user_id").primaryKey().generatedByDefaultAsIdentity(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// FHIR R4 Coverage for insurance eligibility
export const coverage = pgTable("coverage", {
  coverageId: integer("coverage_id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id").references(() => patients.patientId).notNull(),
  status: text("status").notNull().default("active"), // active, cancelled, draft, entered-in-error
  type: text("type").notNull(), // insurance plan type
  subscriberId: text("subscriber_id").notNull(),
  beneficiaryId: text("beneficiary_id"),
  relationship: text("relationship").default("self"), // self, spouse, child, etc.
  period: text("period"), // JSON string for period coverage
  payor: text("payor").notNull(), // insurance company
  class: text("class"), // JSON array of coverage classes
  network: text("network"),
  costToBeneficiary: text("cost_to_beneficiary"), // JSON for copays/deductibles
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// FHIR R4 Communication for messaging
export const communications = pgTable("communications", {
  communicationId: integer("communication_id").primaryKey().generatedByDefaultAsIdentity(),
  status: text("status").notNull().default("completed"), // preparation, in-progress, not-done, on-hold, stopped, completed, entered-in-error, unknown
  category: text("category").notNull(), // alert, notification, reminder, instruction
  priority: text("priority").default("routine"), // routine, urgent, asap, stat
  patientId: integer("patient_id").references(() => patients.patientId).notNull(),
  about: text("about"), // reference to what communication is about
  encounterId: integer("encounter_id").references(() => encounters.encounterId),
  sent: timestamp("sent").defaultNow(),
  received: timestamp("received"),
  recipient: text("recipient").notNull(), // patient, practitioner, etc.
  sender: text("sender").notNull(),
  reasonCode: text("reason_code"), // why communication was sent
  reasonReference: text("reason_reference"), // reference to condition/observation
  payload: text("payload").notNull(), // actual message content as JSON
  note: text("note"), // additional notes
  medium: text("medium").notNull().default("sms"), // sms, email, phone, secure-portal
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Agent Sessions for conversation tracking
export const aiSessions = pgTable("ai_sessions", {
  sessionId: integer("session_id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id").references(() => patients.patientId),
  sessionType: text("session_type").notNull(), // scheduling, eligibility, general
  status: text("status").notNull().default("active"), // active, completed, expired
  channel: text("channel").notNull(), // sms, web, phone, email
  phoneNumber: text("phone_number"),
  email: text("email"),
  startedAt: timestamp("started_at").defaultNow(),
  lastActivity: timestamp("last_activity").defaultNow(),
  completedAt: timestamp("completed_at"),
  context: text("context"), // JSON context data
  audit: text("audit"), // JSON audit trail
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Messages for conversation history
export const aiMessages = pgTable("ai_messages", {
  messageId: integer("message_id").primaryKey().generatedByDefaultAsIdentity(),
  sessionId: integer("session_id").references(() => aiSessions.sessionId).notNull(),
  role: text("role").notNull(), // user, assistant, system
  content: text("content").notNull(),
  metadata: text("metadata"), // JSON metadata like confidence, sources, etc.
  timestamp: timestamp("timestamp").defaultNow(),
  processed: boolean("processed").default(false),
  tools: text("tools"), // JSON array of tools used
  createdAt: timestamp("created_at").defaultNow(),
});

// Appointment slots and availability
export const appointmentSlots = pgTable("appointment_slots", {
  slotId: integer("slot_id").primaryKey().generatedByDefaultAsIdentity(),
  providerId: text("provider_id").notNull(),
  locationId: text("location_id").notNull(),
  serviceType: text("service_type").notNull(), // cardiology, general, specialist
  date: date("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  status: text("status").default("available"), // available, booked, blocked, tentative
  duration: integer("duration").notNull(), // minutes
  specialtyRequired: text("specialty_required"),
  locationName: text("location_name").notNull(),
  providerName: text("provider_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Referrals for specialist appointments
export const referrals = pgTable("referrals", {
  referralId: integer("referral_id").primaryKey().generatedByDefaultAsIdentity(),
  patientId: integer("patient_id").references(() => patients.patientId).notNull(),
  fromProvider: text("from_provider").notNull(), // PCP details
  toProvider: text("to_provider"), // specialist details
  specialty: text("specialty").notNull(), // required specialty
  reason: text("reason").notNull(), // medical reason
  icdCodes: text("icd_codes").notNull(), // JSON array of diagnosis codes
  status: text("status").default("requested"), // requested, approved, denied, expired
  validFrom: date("valid_from").notNull(),
  validTo: date("valid_to").notNull(),
  authNumber: text("auth_number"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  userId: true,
  createdAt: true,
});

export const insertCoverageSchema = createInsertSchema(coverage).omit({
  coverageId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunicationSchema = createInsertSchema(communications).omit({
  communicationId: true,
  createdAt: true,
});

export const insertAISessionSchema = createInsertSchema(aiSessions).omit({
  sessionId: true,
  startedAt: true,
  lastActivity: true,
  createdAt: true,
});

export const insertAIMessageSchema = createInsertSchema(aiMessages).omit({
  messageId: true,
  timestamp: true,
  createdAt: true,
});

export const insertAppointmentSlotSchema = createInsertSchema(appointmentSlots).omit({
  slotId: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  referralId: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCoverage = z.infer<typeof insertCoverageSchema>;
export type Coverage = typeof coverage.$inferSelect;
export type InsertCommunication = z.infer<typeof insertCommunicationSchema>;
export type Communication = typeof communications.$inferSelect;
export type InsertAISession = z.infer<typeof insertAISessionSchema>;
export type AISession = typeof aiSessions.$inferSelect;
export type InsertAIMessage = z.infer<typeof insertAIMessageSchema>;
export type AIMessage = typeof aiMessages.$inferSelect;
export type InsertAppointmentSlot = z.infer<typeof insertAppointmentSlotSchema>;
export type AppointmentSlot = typeof appointmentSlots.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;
