import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: text("patient_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  gender: text("gender").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  race: text("race"),
  ethnicity: text("ethnicity"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  phoneNumber: text("phone_number"),
  email: text("email"),
  primaryLanguage: text("primary_language").default("English"),
  maritalStatus: text("marital_status"),
  insuranceType: text("insurance_type"),
  lastVisitDate: date("last_visit_date"),
  
  // Legacy fields for backward compatibility
  name: text("name").generatedAlwaysAs(sql`concat(first_name, ' ', last_name)`),
  department: text("department").default("General"),
  avatar: text("avatar"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  insuranceProvider: text("insurance_provider"),
  insurancePolicyNumber: text("insurance_policy_number"),
  primaryCarePhysician: text("primary_care_physician"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  billingId: varchar("billing_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // payment, refund, charge
  status: text("status").notNull().default("pending"), // pending, completed, overdue, failed
  description: text("description"),
  paymentMethod: text("payment_method").notNull(), // cash, card, insurance, bank_transfer
  transactionDate: timestamp("transaction_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const billing = pgTable("billing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  invoiceNumber: text("invoice_number").notNull().unique(),
  serviceCode: text("service_code").notNull(), // CPT codes
  serviceDescription: text("service_description").notNull(),
  providerId: text("provider_id").notNull(),
  providerName: text("provider_name").notNull(),
  department: text("department").notNull(),
  serviceDate: date("service_date").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  insuranceAmount: decimal("insurance_amount", { precision: 10, scale: 2 }).default("0.00"),
  patientAmount: decimal("patient_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0.00"),
  outstandingAmount: decimal("outstanding_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, partially_paid, overdue, cancelled
  insuranceClaimId: text("insurance_claim_id"),
  insuranceStatus: text("insurance_status").default("pending"), // pending, approved, denied, processed
  dueDate: date("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
}).extend({
  transactionDate: z.string().optional().transform((val) => val ? new Date(val) : new Date()),
});

export const insertBillingSchema = createInsertSchema(billing).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
export type InsertBilling = z.infer<typeof insertBillingSchema>;
export type Billing = typeof billing.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// FHIR R4 Coverage for insurance eligibility
export const coverage = pgTable("coverage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  status: text("status").notNull().default("completed"), // preparation, in-progress, not-done, on-hold, stopped, completed, entered-in-error, unknown
  category: text("category").notNull(), // alert, notification, reminder, instruction
  priority: text("priority").default("routine"), // routine, urgent, asap, stat
  subject: varchar("subject").references(() => patients.id).notNull(),
  about: text("about"), // reference to what communication is about
  encounter: text("encounter"), // encounter reference
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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id),
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
});

// AI Messages for conversation history
export const aiMessages = pgTable("ai_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => aiSessions.id).notNull(),
  role: text("role").notNull(), // user, assistant, system
  content: text("content").notNull(),
  metadata: text("metadata"), // JSON metadata like confidence, sources, etc.
  timestamp: timestamp("timestamp").defaultNow(),
  processed: boolean("processed").default(false),
  tools: text("tools"), // JSON array of tools used
});

// Appointment slots and availability
export const appointmentSlots = pgTable("appointment_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
});

// Referrals for specialist appointments
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id).notNull(),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCoverageSchema = createInsertSchema(coverage).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunicationSchema = createInsertSchema(communications).omit({
  id: true,
  createdAt: true,
});

export const insertAISessionSchema = createInsertSchema(aiSessions).omit({
  id: true,
  startedAt: true,
  lastActivity: true,
});

export const insertAIMessageSchema = createInsertSchema(aiMessages).omit({
  id: true,
  timestamp: true,
});

export const insertAppointmentSlotSchema = createInsertSchema(appointmentSlots).omit({
  id: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
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
