import { type User, type InsertUser, type Patient, type InsertPatient, type Appointment, type InsertAppointment, type Metrics, type InsertMetrics, type ChartData, type InsertChartData, type Transaction, type InsertTransaction, type Billing, type InsertBilling, users, patients, appointments, metrics, chartData, transactions, billing } from "@shared/schema";
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
  
  getAllBilling(): Promise<Billing[]>;
  getBilling(id: string): Promise<Billing | undefined>;
  createBilling(billing: InsertBilling): Promise<Billing>;
  updateBilling(id: string, billing: InsertBilling): Promise<Billing>;
  deleteBilling(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private patients: Map<string, Patient>;
  private appointments: Map<string, Appointment>;
  private metrics: Metrics | undefined;
  private chartData: Map<string, ChartData>;
  private transactions: Map<string, Transaction>;
  private billingRecords: Map<string, Billing>;

  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.appointments = new Map();
    this.chartData = new Map();
    this.transactions = new Map();
    this.billingRecords = new Map();
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

    // Initialize patients with complete healthcare data
    const patientData = [
      { 
        name: "Brooklyn Simmons", 
        gender: "Male", 
        dateOfBirth: "1995-03-18", 
        department: "Cardiology", 
        patientId: "#OMT23AA", 
        avatar: "BS",
        phoneNumber: "(555) 123-4567",
        email: "brooklyn.simmons@email.com",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        emergencyContactName: "Patricia Simmons",
        emergencyContactPhone: "(555) 123-4568",
        insuranceProvider: "Blue Cross Blue Shield",
        insurancePolicyNumber: "BC123456789",
        primaryCarePhysician: "Dr. Smith"
      },
      { 
        name: "Anthony Johnson", 
        gender: "Male", 
        dateOfBirth: "1997-03-18", 
        department: "Cardiology", 
        patientId: "#AT456BB", 
        avatar: "AJ",
        phoneNumber: "(555) 234-5678",
        email: "anthony.johnson@email.com",
        address: "456 Oak Ave",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90210",
        emergencyContactName: "Mary Johnson",
        emergencyContactPhone: "(555) 234-5679",
        insuranceProvider: "Aetna",
        insurancePolicyNumber: "AET987654321",
        primaryCarePhysician: "Dr. Wilson"
      },
      { 
        name: "Sarah Miller Olivia", 
        gender: "Female", 
        dateOfBirth: "1987-03-18", 
        department: "Oncology", 
        patientId: "#EA789CC", 
        avatar: "SO",
        phoneNumber: "(555) 345-6789",
        email: "sarah.miller@email.com",
        address: "789 Pine Rd",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        emergencyContactName: "David Miller",
        emergencyContactPhone: "(555) 345-6790",
        insuranceProvider: "United Healthcare",
        insurancePolicyNumber: "UHC456789123",
        primaryCarePhysician: "Dr. Davis"
      },
    ];

    patientData.forEach(patient => {
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
    const patient: Patient = { ...insertPatient, id, avatar: insertPatient.avatar || null };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: string, insertPatient: InsertPatient): Promise<Patient> {
    const patient: Patient = { ...insertPatient, id, avatar: insertPatient.avatar || null };
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
      appointmentId: insertTransaction.appointmentId || null,
      billingId: insertTransaction.billingId || null,
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
      appointmentId: insertTransaction.appointmentId || null,
      billingId: insertTransaction.billingId || null,
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

  async getAllBilling(): Promise<Billing[]> {
    return Array.from(this.billingRecords.values());
  }

  async getBilling(id: string): Promise<Billing | undefined> {
    return this.billingRecords.get(id);
  }

  async createBilling(insertBilling: InsertBilling): Promise<Billing> {
    const id = randomUUID();
    const billingRecord: Billing = { 
      ...insertBilling, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.billingRecords.set(id, billingRecord);
    return billingRecord;
  }

  async updateBilling(id: string, insertBilling: InsertBilling): Promise<Billing> {
    const billingRecord: Billing = { 
      ...insertBilling, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.billingRecords.set(id, billingRecord);
    return billingRecord;
  }

  async deleteBilling(id: string): Promise<void> {
    this.billingRecords.delete(id);
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

  async getAllBilling(): Promise<Billing[]> {
    return await db.select().from(billing);
  }

  async getBilling(id: string): Promise<Billing | undefined> {
    const result = await db.select().from(billing).where(eq(billing.id, id));
    return result[0];
  }

  async createBilling(insertBilling: InsertBilling): Promise<Billing> {
    const result = await db.insert(billing).values(insertBilling).returning();
    return result[0];
  }

  async updateBilling(id: string, insertBilling: InsertBilling): Promise<Billing> {
    const result = await db.update(billing).set(insertBilling).where(eq(billing.id, id)).returning();
    return result[0];
  }

  async deleteBilling(id: string): Promise<void> {
    await db.delete(billing).where(eq(billing.id, id));
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

    // Seed 10 patients with comprehensive healthcare data
    const patientData = [
      { 
        name: "Brooklyn Simmons", gender: "Male", dateOfBirth: "1995-03-18", 
        department: "Cardiology", patientId: "#OMT23AA", avatar: "BS",
        phoneNumber: "(555) 123-4567", email: "brooklyn.simmons@email.com", 
        address: "123 Main St", city: "New York", state: "NY", zipCode: "10001",
        emergencyContactName: "Patricia Simmons", emergencyContactPhone: "(555) 123-4568",
        insuranceProvider: "Blue Cross Blue Shield", insurancePolicyNumber: "BC123456789",
        primaryCarePhysician: "Dr. Robert Smith"
      },
      { 
        name: "Anthony Johnson", gender: "Male", dateOfBirth: "1997-03-18",
        department: "Cardiology", patientId: "#AT456BB", avatar: "AJ",
        phoneNumber: "(555) 234-5678", email: "anthony.johnson@email.com",
        address: "456 Oak Ave", city: "Los Angeles", state: "CA", zipCode: "90210",
        emergencyContactName: "Mary Johnson", emergencyContactPhone: "(555) 234-5679",
        insuranceProvider: "Aetna", insurancePolicyNumber: "AET987654321",
        primaryCarePhysician: "Dr. Jennifer Wilson"
      },
      { 
        name: "Sarah Miller Olivia", gender: "Female", dateOfBirth: "1987-03-18",
        department: "Oncology", patientId: "#EA789CC", avatar: "SO",
        phoneNumber: "(555) 345-6789", email: "sarah.miller@email.com",
        address: "789 Pine Rd", city: "Chicago", state: "IL", zipCode: "60601",
        emergencyContactName: "David Miller", emergencyContactPhone: "(555) 345-6790",
        insuranceProvider: "United Healthcare", insurancePolicyNumber: "UHC456789123",
        primaryCarePhysician: "Dr. Michael Davis"
      },
      { 
        name: "Courtney Henry", gender: "Female", dateOfBirth: "1992-11-15",
        department: "Internal Medicine", patientId: "#CH901DD", avatar: "CH",
        phoneNumber: "(555) 456-7890", email: "courtney.henry@email.com",
        address: "321 Elm St", city: "Houston", state: "TX", zipCode: "77001",
        emergencyContactName: "James Henry", emergencyContactPhone: "(555) 456-7891",
        insuranceProvider: "Cigna", insurancePolicyNumber: "CIG234567890",
        primaryCarePhysician: "Dr. Lisa Anderson"
      },
      { 
        name: "Esther Howard", gender: "Female", dateOfBirth: "1985-07-22",
        department: "Dermatology", patientId: "#EH234EE", avatar: "EH",
        phoneNumber: "(555) 567-8901", email: "esther.howard@email.com",
        address: "654 Maple Dr", city: "Phoenix", state: "AZ", zipCode: "85001",
        emergencyContactName: "Robert Howard", emergencyContactPhone: "(555) 567-8902",
        insuranceProvider: "Humana", insurancePolicyNumber: "HUM345678901",
        primaryCarePhysician: "Dr. Sarah Thompson"
      },
      { 
        name: "Arlene McCoy", gender: "Female", dateOfBirth: "1990-04-08",
        department: "Gastroenterology", patientId: "#AM567FF", avatar: "AM",
        phoneNumber: "(555) 678-9012", email: "arlene.mccoy@email.com",
        address: "987 Cedar Ln", city: "Philadelphia", state: "PA", zipCode: "19101",
        emergencyContactName: "William McCoy", emergencyContactPhone: "(555) 678-9013",
        insuranceProvider: "Kaiser Permanente", insurancePolicyNumber: "KP456789012",
        primaryCarePhysician: "Dr. David Lee"
      },
      { 
        name: "Jane Cooper", gender: "Female", dateOfBirth: "1993-09-12",
        department: "Neurology", patientId: "#JC890GG", avatar: "JC",
        phoneNumber: "(555) 789-0123", email: "jane.cooper@email.com",
        address: "147 Birch Ave", city: "San Antonio", state: "TX", zipCode: "78201",
        emergencyContactName: "Tom Cooper", emergencyContactPhone: "(555) 789-0124",
        insuranceProvider: "Molina Healthcare", insurancePolicyNumber: "MOL567890123",
        primaryCarePhysician: "Dr. Maria Garcia"
      },
      { 
        name: "Devon Lane", gender: "Male", dateOfBirth: "1988-02-28",
        department: "Orthopedics", patientId: "#DL123HH", avatar: "DL",
        phoneNumber: "(555) 890-1234", email: "devon.lane@email.com",
        address: "258 Spruce St", city: "San Diego", state: "CA", zipCode: "92101",
        emergencyContactName: "Emily Lane", emergencyContactPhone: "(555) 890-1235",
        insuranceProvider: "Anthem", insurancePolicyNumber: "ANT678901234",
        primaryCarePhysician: "Dr. Kevin Martinez"
      },
      { 
        name: "Marvin McKinney", gender: "Male", dateOfBirth: "1991-12-03",
        department: "Psychiatry", patientId: "#MM456II", avatar: "MM",
        phoneNumber: "(555) 901-2345", email: "marvin.mckinney@email.com",
        address: "369 Willow Rd", city: "Dallas", state: "TX", zipCode: "75201",
        emergencyContactName: "Sandra McKinney", emergencyContactPhone: "(555) 901-2346",
        insuranceProvider: "Health Net", insurancePolicyNumber: "HN789012345",
        primaryCarePhysician: "Dr. Patricia White"
      },
      { 
        name: "Jerome Bell", gender: "Male", dateOfBirth: "1986-06-17",
        department: "Pulmonology", patientId: "#JB789JJ", avatar: "JB",
        phoneNumber: "(555) 012-3456", email: "jerome.bell@email.com",
        address: "741 Ash Blvd", city: "Jacksonville", state: "FL", zipCode: "32201",
        emergencyContactName: "Michelle Bell", emergencyContactPhone: "(555) 012-3457",
        insuranceProvider: "Medicare", insurancePolicyNumber: "MED890123456",
        primaryCarePhysician: "Dr. Christopher Johnson"
      }
    ];

    const patients = [];
    for (const patient of patientData) {
      const createdPatient = await storage.createPatient(patient);
      patients.push(createdPatient);
    }

    // Seed appointments with realistic data
    const appointmentData = [
      { patientId: patients[0].id, patientName: "Brooklyn Simmons", appointmentType: "Cardiology Consultation", appointmentDate: "2024-12-20", appointmentTime: "10:30", status: "scheduled" },
      { patientId: patients[1].id, patientName: "Anthony Johnson", appointmentType: "ECG Test", appointmentDate: "2024-12-21", appointmentTime: "09:00", status: "scheduled" },
      { patientId: patients[2].id, patientName: "Sarah Miller Olivia", appointmentType: "Oncology Follow-up", appointmentDate: "2024-12-22", appointmentTime: "15:00", status: "completed" },
      { patientId: patients[3].id, patientName: "Courtney Henry", appointmentType: "Annual Physical", appointmentDate: "2024-12-19", appointmentTime: "11:00", status: "completed" },
      { patientId: patients[4].id, patientName: "Esther Howard", appointmentType: "Skin Screening", appointmentDate: "2024-12-23", appointmentTime: "14:00", status: "scheduled" },
      { patientId: patients[5].id, patientName: "Arlene McCoy", appointmentType: "Endoscopy", appointmentDate: "2024-12-24", appointmentTime: "08:30", status: "scheduled" },
      { patientId: patients[6].id, patientName: "Jane Cooper", appointmentType: "MRI Scan", appointmentDate: "2024-12-18", appointmentTime: "16:00", status: "completed" },
      { patientId: patients[7].id, patientName: "Devon Lane", appointmentType: "X-Ray", appointmentDate: "2024-12-25", appointmentTime: "13:30", status: "scheduled" },
      { patientId: patients[8].id, patientName: "Marvin McKinney", appointmentType: "Therapy Session", appointmentDate: "2024-12-26", appointmentTime: "10:00", status: "scheduled" },
      { patientId: patients[9].id, patientName: "Jerome Bell", appointmentType: "Pulmonary Function Test", appointmentDate: "2024-12-27", appointmentTime: "12:00", status: "scheduled" }
    ];

    const appointments = [];
    for (const appointment of appointmentData) {
      const createdAppointment = await storage.createAppointment(appointment);
      appointments.push(createdAppointment);
    }

    // Seed billing data with realistic healthcare services and CPT codes
    const billingData = [
      {
        patientId: patients[0].id, appointmentId: appointments[0].id, invoiceNumber: "INV-2024-001",
        serviceCode: "99213", serviceDescription: "Office/outpatient visit, est", 
        providerId: "PROV001", providerName: "Dr. Robert Smith", department: "Cardiology",
        serviceDate: "2024-12-15", totalAmount: "285.00", insuranceAmount: "228.00",
        patientAmount: "57.00", outstandingAmount: "57.00", status: "pending",
        insuranceClaimId: "CLM240001", dueDate: "2025-01-15"
      },
      {
        patientId: patients[1].id, appointmentId: appointments[1].id, invoiceNumber: "INV-2024-002",
        serviceCode: "93000", serviceDescription: "Electrocardiogram, routine ECG",
        providerId: "PROV001", providerName: "Dr. Robert Smith", department: "Cardiology", 
        serviceDate: "2024-12-16", totalAmount: "150.00", insuranceAmount: "120.00",
        patientAmount: "30.00", outstandingAmount: "30.00", status: "pending",
        insuranceClaimId: "CLM240002", dueDate: "2025-01-16"
      },
      {
        patientId: patients[2].id, appointmentId: appointments[2].id, invoiceNumber: "INV-2024-003",
        serviceCode: "99214", serviceDescription: "Office/outpatient visit, detailed",
        providerId: "PROV002", providerName: "Dr. Michael Davis", department: "Oncology",
        serviceDate: "2024-12-17", totalAmount: "475.00", insuranceAmount: "380.00",
        patientAmount: "95.00", paidAmount: "95.00", outstandingAmount: "0.00", 
        status: "paid", insuranceClaimId: "CLM240003", dueDate: "2025-01-17"
      },
      {
        patientId: patients[3].id, appointmentId: appointments[3].id, invoiceNumber: "INV-2024-004",
        serviceCode: "99395", serviceDescription: "Preventive medicine evaluation",
        providerId: "PROV003", providerName: "Dr. Lisa Anderson", department: "Internal Medicine",
        serviceDate: "2024-12-18", totalAmount: "320.00", insuranceAmount: "320.00",
        patientAmount: "0.00", paidAmount: "320.00", outstandingAmount: "0.00",
        status: "paid", insuranceClaimId: "CLM240004", dueDate: "2025-01-18"
      },
      {
        patientId: patients[4].id, appointmentId: appointments[4].id, invoiceNumber: "INV-2024-005",
        serviceCode: "11420", serviceDescription: "Excision, benign lesion",
        providerId: "PROV004", providerName: "Dr. Sarah Thompson", department: "Dermatology",
        serviceDate: "2024-12-19", totalAmount: "425.00", insuranceAmount: "340.00",
        patientAmount: "85.00", outstandingAmount: "85.00", status: "pending",
        insuranceClaimId: "CLM240005", dueDate: "2025-01-19"
      }
    ];

    const billingRecords = [];
    for (const billing of billingData) {
      const createdBilling = await storage.createBilling(billing);
      billingRecords.push(createdBilling);
    }

    // Seed transaction data with realistic payment scenarios  
    const transactionData = [
      {
        patientId: patients[0].id, appointmentId: appointments[0].id, billingId: billingRecords[0].id,
        amount: "57.00", type: "charge", status: "pending", 
        description: "Patient copay for cardiology consultation", paymentMethod: "insurance"
      },
      {
        patientId: patients[1].id, appointmentId: appointments[1].id, billingId: billingRecords[1].id,
        amount: "30.00", type: "charge", status: "pending",
        description: "Patient copay for ECG test", paymentMethod: "insurance"
      },
      {
        patientId: patients[2].id, appointmentId: appointments[2].id, billingId: billingRecords[2].id,
        amount: "95.00", type: "payment", status: "completed",
        description: "Patient copay payment received", paymentMethod: "card"
      },
      {
        patientId: patients[3].id, appointmentId: appointments[3].id, billingId: billingRecords[3].id,
        amount: "320.00", type: "payment", status: "completed", 
        description: "Insurance payment for annual physical", paymentMethod: "insurance"
      },
      {
        patientId: patients[4].id, appointmentId: appointments[4].id, billingId: billingRecords[4].id,
        amount: "85.00", type: "charge", status: "pending",
        description: "Patient copay for dermatology procedure", paymentMethod: "insurance"
      },
      {
        patientId: patients[5].id, amount: "250.00", type: "payment", status: "completed",
        description: "Cash payment for lab tests", paymentMethod: "cash"
      },
      {
        patientId: patients[6].id, amount: "1200.00", type: "payment", status: "completed",
        description: "Insurance payment for MRI scan", paymentMethod: "insurance"
      },
      {
        patientId: patients[7].id, amount: "180.00", type: "charge", status: "pending",
        description: "X-ray imaging charges", paymentMethod: "card"
      },
      {
        patientId: patients[8].id, amount: "120.00", type: "payment", status: "completed",
        description: "Copay for therapy session", paymentMethod: "bank_transfer"
      },
      {
        patientId: patients[9].id, amount: "350.00", type: "charge", status: "overdue",
        description: "Outstanding balance for pulmonary function test", paymentMethod: "card"
      }
    ];

    for (const transaction of transactionData) {
      await storage.createTransaction(transaction);
    }

    console.log("Storage seeded successfully with 10 patients, 10 appointments, 5 billing records, and 10 transactions!");
  } catch (error) {
    console.error("Error seeding storage:", error);
  }
}

// Initialize storage and seed data after a small delay to ensure server is ready
setTimeout(() => {
  seedDatabase().catch(console.error);
}, 100);
