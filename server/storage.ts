import { type User, type InsertUser, type Patient, type InsertPatient, type Appointment, type InsertAppointment, type Metrics, type InsertMetrics, type ChartData, type InsertChartData, type Transaction, type InsertTransaction, users, patients, appointments, metrics, chartData, transactions } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import ws from "ws";

neonConfig.fetchConnectionCache = true;
neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, patient: InsertPatient): Promise<Patient>;
  deletePatient(id: string): Promise<void>;
  
  getAllAppointments(): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: InsertAppointment): Promise<Appointment>;
  deleteAppointment(id: string): Promise<void>;
  
  getMetrics(): Promise<Metrics | undefined>;
  updateMetrics(metrics: InsertMetrics): Promise<Metrics>;
  
  getChartData(): Promise<ChartData[]>;
  createChartData(data: InsertChartData): Promise<ChartData>;
  
  getAllTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: InsertTransaction): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private patients: Map<string, Patient>;
  private appointments: Map<string, Appointment>;
  private metrics: Metrics | undefined;
  private chartData: Map<string, ChartData>;
  private transactions: Map<string, Transaction>;

  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.appointments = new Map();
    this.chartData = new Map();
    this.transactions = new Map();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize metrics
    this.metrics = {
      id: randomUUID(),
      totalPatients: 579,
      totalAppointments: 54,
      totalIncome: "8399.24",
      totalTreatments: 112,
      patientGrowth: "+15%",
      appointmentGrowth: "+10%",
      incomeGrowth: "+28%",
      treatmentGrowth: "+12%",
      updatedAt: new Date(),
    };

    // Initialize chart data
    const chartDataItems = [
      { month: "Jan", hospitalizedPatients: 100, outpatients: 80 },
      { month: "Feb", hospitalizedPatients: 120, outpatients: 90 },
      { month: "Mar", hospitalizedPatients: 115, outpatients: 70 },
      { month: "Apr", hospitalizedPatients: 140, outpatients: 130 },
      { month: "May", hospitalizedPatients: 180, outpatients: 150 },
      { month: "Jun", hospitalizedPatients: 130, outpatients: 98 },
    ];

    chartDataItems.forEach(item => {
      const id = randomUUID();
      const chartDataItem: ChartData = { ...item, id };
      this.chartData.set(id, chartDataItem);
    });

    // Initialize patients with EHR-style data structure
    const ehrPatientData = [
      {
        firstName: "Brooklyn",
        lastName: "Simmons",
        dateOfBirth: "1995-03-18",
        gender: "Male",
        phone: "+1-555-0101",
        email: "brooklyn.simmons@email.com",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        race: "White",
        ethnicity: "Non-Hispanic",
        primaryLanguage: "English",
        maritalStatus: "Single",
        insuranceType: "Blue Cross Blue Shield",
        medicalRecordNumber: "MRN001234"
      },
      {
        firstName: "Sarah",
        lastName: "Johnson",
        dateOfBirth: "1988-07-15",
        gender: "Female",
        phone: "+1-555-0102",
        email: "sarah.johnson@email.com",
        address: "456 Oak Ave",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90210",
        race: "Hispanic",
        ethnicity: "Hispanic or Latino",
        primaryLanguage: "Spanish",
        maritalStatus: "Married",
        insuranceType: "Aetna",
        medicalRecordNumber: "MRN001235"
      },
      {
        firstName: "Michael",
        lastName: "Chen",
        dateOfBirth: "1982-12-03",
        gender: "Male",
        phone: "+1-555-0103",
        email: "michael.chen@email.com",
        address: "789 Pine St",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        race: "Asian",
        ethnicity: "Non-Hispanic",
        primaryLanguage: "English",
        maritalStatus: "Married",
        insuranceType: "United Healthcare",
        medicalRecordNumber: "MRN001236"
      },
      {
        firstName: "Emily",
        lastName: "Davis",
        dateOfBirth: "1990-04-22",
        gender: "Female",
        phone: "+1-555-0104",
        email: "emily.davis@email.com",
        address: "321 Elm St",
        city: "Houston",
        state: "TX",
        zipCode: "77001",
        race: "Black or African American",
        ethnicity: "Non-Hispanic",
        primaryLanguage: "English",
        maritalStatus: "Single",
        insuranceType: "Cigna",
        medicalRecordNumber: "MRN001237"
      },
      {
        firstName: "Robert",
        lastName: "Wilson",
        dateOfBirth: "1975-11-08",
        gender: "Male",
        phone: "+1-555-0105",
        email: "robert.wilson@email.com",
        address: "654 Maple Dr",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85001",
        race: "White",
        ethnicity: "Non-Hispanic",
        primaryLanguage: "English",
        maritalStatus: "Divorced",
        insuranceType: "Medicare",
        medicalRecordNumber: "MRN001238"
      }
    ];

    ehrPatientData.forEach(patient => {
      const id = randomUUID();
      const patientRecord: Patient = { 
        ...patient, 
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.patients.set(id, patientRecord);
    });

    // Initialize appointments
    const appointmentData = [
      { patientName: "Brooklyn Simmons", appointmentType: "Allergy Testing", appointmentDate: "2024-08-16", appointmentTime: "10:30", status: "scheduled" },
      { patientName: "Courtney Henry", appointmentType: "Routine Lab Tests", appointmentDate: "2024-08-16", appointmentTime: "10:00", status: "scheduled" },
      { patientName: "Sarah Miller Olivia", appointmentType: "Chronic Disease Management", appointmentDate: "2024-08-15", appointmentTime: "15:00", status: "scheduled" },
      { patientName: "Esther Howard", appointmentType: "Allergy Testing", appointmentDate: "2024-08-15", appointmentTime: "14:00", status: "scheduled" },
      { patientName: "Arlene McCoy", appointmentType: "Routine Lab Tests", appointmentDate: "2024-08-15", appointmentTime: "11:30", status: "scheduled" },
      { patientName: "Jane Cooper", appointmentType: "Acute Illness", appointmentDate: "2024-08-15", appointmentTime: "10:00", status: "scheduled" },
    ];

    appointmentData.forEach(appointment => {
      const id = randomUUID();
      const appointmentRecord: Appointment = { ...appointment, id, patientId: randomUUID() };
      this.appointments.set(id, appointmentRecord);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = randomUUID();
    const patient: Patient = { 
      ...insertPatient, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: string, insertPatient: InsertPatient): Promise<Patient> {
    const patient: Patient = { 
      ...insertPatient, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.patients.set(id, patient);
    return patient;
  }

  async deletePatient(id: string): Promise<void> {
    this.patients.delete(id);
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = { ...insertAppointment, id, status: insertAppointment.status || null };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: string, insertAppointment: InsertAppointment): Promise<Appointment> {
    const appointment: Appointment = { ...insertAppointment, id, status: insertAppointment.status || null };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async deleteAppointment(id: string): Promise<void> {
    this.appointments.delete(id);
  }

  async getMetrics(): Promise<Metrics | undefined> {
    return this.metrics;
  }

  async updateMetrics(insertMetrics: InsertMetrics): Promise<Metrics> {
    const id = this.metrics?.id || randomUUID();
    this.metrics = { ...insertMetrics, id, updatedAt: new Date() };
    return this.metrics;
  }

  async getChartData(): Promise<ChartData[]> {
    return Array.from(this.chartData.values());
  }

  async createChartData(insertData: InsertChartData): Promise<ChartData> {
    const id = randomUUID();
    const data: ChartData = { ...insertData, id };
    this.chartData.set(id, data);
    return data;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      status: insertTransaction.status || "pending",
      description: insertTransaction.description || null,
      transactionDate: insertTransaction.transactionDate || new Date(),
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, insertTransaction: InsertTransaction): Promise<Transaction> {
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      status: insertTransaction.status || "pending",
      description: insertTransaction.description || null,
      transactionDate: insertTransaction.transactionDate || new Date(),
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    this.transactions.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllPatients(): Promise<Patient[]> {
    return await db.select().from(patients);
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    const result = await db.select().from(patients).where(eq(patients.id, id));
    return result[0];
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const result = await db.insert(patients).values(insertPatient).returning();
    return result[0];
  }

  async updatePatient(id: string, insertPatient: InsertPatient): Promise<Patient> {
    const result = await db.update(patients).set(insertPatient).where(eq(patients.id, id)).returning();
    return result[0];
  }

  async deletePatient(id: string): Promise<void> {
    await db.delete(patients).where(eq(patients.id, id));
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments);
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const result = await db.select().from(appointments).where(eq(appointments.id, id));
    return result[0];
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values(insertAppointment).returning();
    return result[0];
  }

  async updateAppointment(id: string, insertAppointment: InsertAppointment): Promise<Appointment> {
    const result = await db.update(appointments).set(insertAppointment).where(eq(appointments.id, id)).returning();
    return result[0];
  }

  async deleteAppointment(id: string): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  async getMetrics(): Promise<Metrics | undefined> {
    const result = await db.select().from(metrics).limit(1);
    return result[0];
  }

  async updateMetrics(insertMetrics: InsertMetrics): Promise<Metrics> {
    const existing = await this.getMetrics();
    if (existing) {
      const result = await db.update(metrics).set(insertMetrics).where(eq(metrics.id, existing.id)).returning();
      return result[0];
    } else {
      const result = await db.insert(metrics).values(insertMetrics).returning();
      return result[0];
    }
  }

  async getChartData(): Promise<ChartData[]> {
    return await db.select().from(chartData);
  }

  async createChartData(insertData: InsertChartData): Promise<ChartData> {
    const result = await db.insert(chartData).values(insertData).returning();
    return result[0];
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions);
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id));
    return result[0];
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(insertTransaction).returning();
    return result[0];
  }

  async updateTransaction(id: string, insertTransaction: InsertTransaction): Promise<Transaction> {
    const result = await db.update(transactions).set(insertTransaction).where(eq(transactions.id, id)).returning();
    return result[0];
  }

  async deleteTransaction(id: string): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }
}

// Initialize storage - use database storage for persistence
export const storage: IStorage = new DatabaseStorage();

// Alternative: Async function to get storage with database fallback
export async function getStorage(): Promise<IStorage> {
  try {
    if (process.env.DATABASE_URL) {
      const dbStorage = new DatabaseStorage();
      // Test the connection
      await dbStorage.getAllPatients();
      console.log("Using database storage");
      return dbStorage;
    } else {
      throw new Error("No database URL configured");
    }
  } catch (error) {
    console.log("Database not available, using in-memory storage");
    return new MemStorage();
  }
}

// Seed function to populate database with dummy data
export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingPatients = await storage.getAllPatients();
    if (existingPatients.length > 0) {
      console.log("Database already seeded with", existingPatients.length, "patients");
      return;
    }

    console.log("Seeding database with dummy data...");

    // Seed metrics
    await storage.updateMetrics({
      totalPatients: 579,
      totalAppointments: 54,
      totalIncome: "8399.24",
      totalTreatments: 112,
      patientGrowth: "+15%",
      appointmentGrowth: "+10%",
      incomeGrowth: "+28%",
      treatmentGrowth: "+12%",
    });

    // Seed chart data
    const chartDataItems = [
      { month: "Jan", hospitalizedPatients: 100, outpatients: 80 },
      { month: "Feb", hospitalizedPatients: 120, outpatients: 90 },
      { month: "Mar", hospitalizedPatients: 115, outpatients: 70 },
      { month: "Apr", hospitalizedPatients: 140, outpatients: 130 },
      { month: "May", hospitalizedPatients: 180, outpatients: 150 },
      { month: "Jun", hospitalizedPatients: 130, outpatients: 98 },
    ];

    for (const item of chartDataItems) {
      await storage.createChartData(item);
    }

    // Seed 10 patients as requested
    const patientData = [
      { name: "Brooklyn Simmons", gender: "Male", dateOfBirth: "1995-03-18", department: "Cardiology", patientId: "#OMT23AA", avatar: "BS" },
      { name: "Anthony Johnson", gender: "Male", dateOfBirth: "1997-03-18", department: "Cardiology", patientId: "#AT456BB", avatar: "AJ" },
      { name: "Sarah Miller Olivia", gender: "Female", dateOfBirth: "1987-03-18", department: "Oncology", patientId: "#EA789CC", avatar: "SO" },
      { name: "Courtney Henry", gender: "Female", dateOfBirth: "1992-07-22", department: "Dermatology", patientId: "#CH890DD", avatar: "CH" },
      { name: "Esther Howard", gender: "Female", dateOfBirth: "1989-11-15", department: "Neurology", patientId: "#EH123EE", avatar: "EH" },
      { name: "Arlene McCoy", gender: "Female", dateOfBirth: "1993-05-08", department: "Pediatrics", patientId: "#AM456FF", avatar: "AM" },
      { name: "Jane Cooper", gender: "Female", dateOfBirth: "1985-12-03", department: "Emergency", patientId: "#JC789GG", avatar: "JC" },
      { name: "Robert Fox", gender: "Male", dateOfBirth: "1991-02-28", department: "Orthopedics", patientId: "#RF012HH", avatar: "RF" },
      { name: "Jenny Wilson", gender: "Female", dateOfBirth: "1994-08-17", department: "Gynecology", patientId: "#JW345II", avatar: "JW" },
      { name: "Kristin Watson", gender: "Female", dateOfBirth: "1990-10-12", department: "Psychiatry", patientId: "#KW678JJ", avatar: "KW" }
    ];

    const createdPatients = [];
    for (const patient of patientData) {
      const created = await storage.createPatient({
        ...patient,
        avatar: patient.avatar || null
      });
      createdPatients.push(created);
    }

    // Seed appointments with references to created patients
    const appointmentData = [
      { patientId: createdPatients[0].id, patientName: "Brooklyn Simmons", appointmentType: "Allergy Testing", appointmentDate: "2024-08-16", appointmentTime: "10:30", status: "scheduled" },
      { patientId: createdPatients[3].id, patientName: "Courtney Henry", appointmentType: "Routine Lab Tests", appointmentDate: "2024-08-16", appointmentTime: "10:00", status: "scheduled" },
      { patientId: createdPatients[2].id, patientName: "Sarah Miller Olivia", appointmentType: "Chronic Disease Management", appointmentDate: "2024-08-15", appointmentTime: "15:00", status: "scheduled" },
      { patientId: createdPatients[4].id, patientName: "Esther Howard", appointmentType: "Allergy Testing", appointmentDate: "2024-08-15", appointmentTime: "14:00", status: "scheduled" },
      { patientId: createdPatients[5].id, patientName: "Arlene McCoy", appointmentType: "Routine Lab Tests", appointmentDate: "2024-08-15", appointmentTime: "11:30", status: "scheduled" },
      { patientId: createdPatients[6].id, patientName: "Jane Cooper", appointmentType: "Acute Illness", appointmentDate: "2024-08-15", appointmentTime: "10:00", status: "scheduled" },
      { patientId: createdPatients[7].id, patientName: "Robert Fox", appointmentType: "Surgery Consultation", appointmentDate: "2024-08-17", appointmentTime: "09:00", status: "scheduled" },
      { patientId: createdPatients[8].id, patientName: "Jenny Wilson", appointmentType: "Routine Checkup", appointmentDate: "2024-08-17", appointmentTime: "14:30", status: "scheduled" },
      { patientId: createdPatients[9].id, patientName: "Kristin Watson", appointmentType: "Mental Health Assessment", appointmentDate: "2024-08-18", appointmentTime: "11:00", status: "scheduled" },
      { patientId: createdPatients[1].id, patientName: "Anthony Johnson", appointmentType: "Cardiology Follow-up", appointmentDate: "2024-08-18", appointmentTime: "16:00", status: "scheduled" }
    ];

    for (const appointment of appointmentData) {
      await storage.createAppointment({
        ...appointment,
        status: appointment.status || null
      });
    }

    console.log(`Storage seeded successfully with ${patientData.length} patients and ${appointmentData.length} appointments!`);
  } catch (error) {
    console.error("Error seeding storage:", error);
  }
}

// Initialize storage and seed data after a small delay to ensure server is ready
setTimeout(() => {
  seedDatabase().catch(console.error);
}, 100);
