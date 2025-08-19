import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { eq, sql } from "drizzle-orm";
import ws from "ws";
import { type Patient, type InsertPatient } from "@shared/schema";

// Configure Neon for EHR database connection
neonConfig.fetchConnectionCache = true;
neonConfig.webSocketConstructor = ws;

// Create EHR database connection
const ehrPool = new Pool({ connectionString: process.env.EHR_DATABASE_URL });
const ehrDb = drizzle(ehrPool);

export interface EHRPatientData {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  race?: string;
  ethnicity?: string;
  primary_language?: string;
  marital_status?: string;
  insurance_type?: string;
  medical_record_number?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class EHRService {
  /**
   * Retrieve all patients from the external EHR database
   */
  async getAllEHRPatients(): Promise<EHRPatientData[]> {
    try {
      console.log("Connecting to EHR database to retrieve patients...");
      
      // Query the EHR database for patients
      const result = await ehrDb.execute(sql`
        SELECT 
          id,
          first_name,
          last_name,
          date_of_birth,
          gender,
          phone,
          email,
          address,
          city,
          state,
          zip_code,
          race,
          ethnicity,
          primary_language,
          marital_status,
          insurance_type,
          medical_record_number,
          created_at,
          updated_at
        FROM patients 
        ORDER BY created_at DESC
      `);

      console.log(`Retrieved ${result.rows.length} patients from EHR database`);
      return result.rows as unknown as EHRPatientData[];
    } catch (error) {
      console.error("Error connecting to EHR database:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to retrieve EHR patients: ${errorMessage}`);
    }
  }

  /**
   * Get a specific patient from EHR database by ID
   */
  async getEHRPatient(id: string): Promise<EHRPatientData | null> {
    try {
      const result = await ehrDb.execute(sql`
        SELECT 
          id,
          first_name,
          last_name,
          date_of_birth,
          gender,
          phone,
          email,
          address,
          city,
          state,
          zip_code,
          race,
          ethnicity,
          primary_language,
          marital_status,
          insurance_type,
          medical_record_number,
          created_at,
          updated_at
        FROM patients 
        WHERE id = ${id}
      `);

      return (result.rows[0] as unknown as EHRPatientData) || null;
    } catch (error) {
      console.error("Error retrieving EHR patient:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to retrieve EHR patient: ${errorMessage}`);
    }
  }

  /**
   * Search EHR patients by name, phone, or medical record number
   */
  async searchEHRPatients(searchTerm: string): Promise<EHRPatientData[]> {
    try {
      const result = await ehrDb.execute(sql`
        SELECT 
          id,
          first_name,
          last_name,
          date_of_birth,
          gender,
          phone,
          email,
          address,
          city,
          state,
          zip_code,
          race,
          ethnicity,
          primary_language,
          marital_status,
          insurance_type,
          medical_record_number,
          created_at,
          updated_at
        FROM patients 
        WHERE 
          LOWER(first_name) LIKE LOWER(${`%${searchTerm}%`}) OR
          LOWER(last_name) LIKE LOWER(${`%${searchTerm}%`}) OR
          phone LIKE ${`%${searchTerm}%`} OR
          medical_record_number LIKE ${`%${searchTerm}%`}
        ORDER BY last_name, first_name
      `);

      return result.rows as unknown as EHRPatientData[];
    } catch (error) {
      console.error("Error searching EHR patients:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to search EHR patients: ${errorMessage}`);
    }
  }

  /**
   * Convert EHR patient data to our local patient format
   */
  convertEHRToLocalPatient(ehrPatient: EHRPatientData): InsertPatient {
    return {
      name: `${ehrPatient.first_name} ${ehrPatient.last_name}`,
      gender: ehrPatient.gender || "Unknown",
      dateOfBirth: ehrPatient.date_of_birth,
      department: this.inferDepartmentFromData(ehrPatient),
      patientId: ehrPatient.medical_record_number || `#EHR${ehrPatient.id.slice(-6).toUpperCase()}`,
      avatar: this.generateAvatarInitials(ehrPatient.first_name, ehrPatient.last_name),
    };
  }

  /**
   * Infer department based on patient data (can be enhanced with more logic)
   */
  private inferDepartmentFromData(ehrPatient: EHRPatientData): string {
    // Basic logic to infer department - can be enhanced
    const age = this.calculateAge(ehrPatient.date_of_birth);
    
    if (age < 18) return "Pediatrics";
    if (age > 65) return "Geriatrics";
    
    // Default to general medicine
    return "General Medicine";
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Generate avatar initials from first and last name
   */
  private generateAvatarInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
    return `${firstInitial}${lastInitial}`;
  }

  /**
   * Test the EHR database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await ehrDb.execute(sql`SELECT 1 as test`);
      console.log("EHR database connection successful");
      return true;
    } catch (error) {
      console.error("EHR database connection failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const ehrService = new EHRService();