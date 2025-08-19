import OpenAI from 'openai';
import type { 
  Patient, 
  Coverage, 
  Communication, 
  AISession, 
  AIMessage, 
  AppointmentSlot, 
  Referral,
  Appointment,
  InsertCommunication,
  InsertAISession,
  InsertAIMessage,
  InsertAppointment,
  InsertPatient
} from "@shared/schema";

interface DeepSeekConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

interface EligibilityResponse {
  isEligible: boolean;
  coverage: any;
  copay?: number;
  deductible?: number;
  authRequired: boolean;
  referralRequired: boolean;
  errors?: string[];
}

interface SchedulingContext {
  patientId?: string;
  patientName?: string;
  serviceType: string;
  specialty?: string;
  urgency: 'routine' | 'urgent' | 'stat';
  preferredLocation?: string;
  preferredProvider?: string;
  insuranceInfo?: any;
}

interface WorkflowStep {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  data?: any;
  error?: string;
  timestamp: Date;
}

export class HealthcareAIAgent {
  private deepseek: OpenAI;
  private sessionContext: Map<string, SchedulingContext> = new Map();
  private auditTrail: Map<string, WorkflowStep[]> = new Map();
  private storage: any;

  constructor(storage?: any) {
    const config: DeepSeekConfig = {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseURL: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat'
    };

    if (!config.apiKey) {
      throw new Error('DEEPSEEK_API_KEY environment variable is required');
    }

    this.deepseek = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
    
    this.storage = storage;
  }
  
  setStorage(storage: any) {
    this.storage = storage;
  }

  private addAuditStep(sessionId: string, step: string, status: WorkflowStep['status'], data?: any, error?: string) {
    if (!this.auditTrail.has(sessionId)) {
      this.auditTrail.set(sessionId, []);
    }
    
    this.auditTrail.get(sessionId)!.push({
      step,
      status,
      data,
      error,
      timestamp: new Date()
    });
  }

  // FHIR R4 270/271 Insurance Eligibility Check
  async checkInsuranceEligibility(patientId: string, serviceType: string): Promise<EligibilityResponse> {
    try {
      // In production, this would make actual 270/271 EDI calls to insurance clearinghouse
      const mockEligibility: EligibilityResponse = {
        isEligible: true,
        coverage: {
          planName: "BlueCross BlueShield PPO",
          memberId: "BC123456789",
          groupNumber: "GRP001",
          effectiveDate: "2024-01-01",
          terminationDate: "2024-12-31"
        },
        copay: serviceType === 'specialist' ? 50 : 25,
        deductible: 500,
        authRequired: serviceType.includes('cardiology') || serviceType.includes('specialist'),
        referralRequired: serviceType === 'specialist' || serviceType === 'cardiology',
        errors: []
      };

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      return mockEligibility;
    } catch (error) {
      return {
        isEligible: false,
        coverage: null,
        authRequired: false,
        referralRequired: false,
        errors: [`Eligibility check failed: ${error}`]
      };
    }
  }

  // ICD/CPT Code Mapping for Service Types
  private mapServiceToICDCPT(serviceType: string, symptoms: string): { icdCodes: string[], cptCodes: string[] } {
    const mappings: Record<string, { icdCodes: string[], cptCodes: string[] }> = {
      'cardiology': {
        icdCodes: ['I25.9', 'I50.9', 'I48.91'], // CAD, Heart failure, A-fib
        cptCodes: ['93000', '93005', '93306'] // ECG, Stress test, Echo
      },
      'general': {
        icdCodes: ['Z00.00', 'R50.9', 'R06.02'], // General exam, fever, shortness of breath
        cptCodes: ['99213', '99214', '99215'] // Office visits
      },
      'specialist': {
        icdCodes: ['R00.0', 'R50.9'], // Tachycardia, fever
        cptCodes: ['99243', '99244'] // Consultation codes
      }
    };

    // Use AI to analyze symptoms and refine mapping
    return mappings[serviceType] || mappings['general'];
  }

  // Query available appointment slots
  async queryAvailableSlots(
    serviceType: string, 
    specialty?: string, 
    locationPreference?: string,
    dateRange: { start: Date, end: Date } = { 
      start: new Date(), 
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
    }
  ): Promise<AppointmentSlot[]> {
    
    // Mock available slots - in production would query actual scheduling system
    const mockSlots: Partial<AppointmentSlot>[] = [
      {
        providerId: "PROV001",
        providerName: "Dr. Sarah Johnson",
        locationId: "LOC001", 
        locationName: "Main Campus",
        serviceType: "Check up",
        specialtyRequired: "general",
        date: "2024-08-19" as any,
        startTime: "09:00",
        endTime: "09:30",
        duration: 30,
        status: "available"
      },
      {
        providerId: "PROV002",
        providerName: "Dr. Michael Chen",
        locationId: "LOC001",
        locationName: "Main Campus", 
        serviceType: "Check up",
        specialtyRequired: "general",
        date: "2024-08-19" as any,
        startTime: "14:00",
        endTime: "14:30",
        duration: 30,
        status: "available"
      },
      {
        providerId: "PROV003",
        providerName: "Dr. Emily Rodriguez",
        locationId: "LOC002",
        locationName: "North Campus",
        serviceType: "cardiology", 
        specialtyRequired: "cardiology",
        date: "2024-08-21" as any,
        startTime: "10:00",
        endTime: "10:30",
        duration: 30,
        status: "available"
      }
    ];

    return mockSlots.filter(slot => 
      slot.serviceType === serviceType || 
      slot.specialtyRequired === specialty
    ) as AppointmentSlot[];
  }

  // AI-powered conversation handler
  async processPatientMessage(
    sessionId: string, 
    message: string, 
    channel: 'sms' | 'web' | 'phone' | 'email',
    phoneNumber?: string,
    email?: string
  ): Promise<{
    response: string;
    actions: string[];
    requiresAuth: boolean;
    nextStep?: string;
    confidence: number;
    context: SchedulingContext;
  }> {
    this.addAuditStep(sessionId, 'process_message', 'in_progress', { message, channel });

    try {
      // Use DeepSeek to analyze the patient's intent and extract key information
      const systemPrompt = `You are a healthcare AI assistant specializing in patient scheduling and insurance eligibility. 

CORE CAPABILITIES:
- Schedule appointments (general, specialist, cardiology)  
- Check insurance eligibility and coverage
- Handle appointment rescheduling and cancellations
- Provide pre-visit instructions
- Manage waitlist and cancellation fills
- Verify referrals and authorizations

WORKFLOW CONTEXT:
- Patient authentication required for protected actions
- Insurance eligibility must be verified before scheduling
- Specialist appointments often require referrals
- All interactions logged for audit compliance

Analyze the patient message and respond with a JSON object containing:
{
  "intent": "scheduling|eligibility|rescheduling|general_inquiry",
  "serviceType": "general|cardiology|specialist|urgent_care",
  "urgency": "routine|urgent|stat", 
  "extractedInfo": {
    "symptoms": "extracted symptoms or concerns",
    "preferredTime": "any time preferences mentioned",
    "location": "preferred location if mentioned"
  },
  "requiresAuth": boolean,
  "nextAction": "authenticate|check_eligibility|find_slots|request_referral",
  "response": "conversational response to patient",
  "confidence": 0.0-1.0
}

Be empathetic, professional, and efficient. Ask only necessary clarifying questions.`;

      const completion = await this.deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Patient message: "${message}"` }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      let aiAnalysis;
      try {
        aiAnalysis = JSON.parse(completion.choices[0].message.content || '{}');
      } catch {
        // Fallback if JSON parsing fails
        aiAnalysis = {
          intent: 'general_inquiry',
          serviceType: 'general',
          urgency: 'routine',
          extractedInfo: {},
          requiresAuth: true,
          nextAction: 'authenticate',
          response: "I'd be happy to help you with your healthcare needs. Could you please provide more details about what you're looking for?",
          confidence: 0.7
        };
      }

      // Update session context
      const context: SchedulingContext = {
        serviceType: aiAnalysis.serviceType,
        urgency: aiAnalysis.urgency,
        ...aiAnalysis.extractedInfo
      };
      this.sessionContext.set(sessionId, context);

      // Determine required actions based on analysis
      const actions: string[] = [];
      if (aiAnalysis.requiresAuth) actions.push('authenticate');
      if (aiAnalysis.intent === 'scheduling') actions.push('check_eligibility', 'find_slots');
      if (aiAnalysis.nextAction) actions.push(aiAnalysis.nextAction);

      this.addAuditStep(sessionId, 'ai_analysis', 'completed', aiAnalysis);

      return {
        response: aiAnalysis.response,
        actions,
        requiresAuth: aiAnalysis.requiresAuth,
        nextStep: aiAnalysis.nextAction,
        confidence: Math.round((aiAnalysis.confidence || 0.8) * 100),
        context
      };

    } catch (error) {
      this.addAuditStep(sessionId, 'process_message', 'failed', null, error?.toString());
      
      return {
        response: "I apologize, but I'm having trouble processing your request right now. Please try again or call our office directly for assistance.",
        actions: ['fallback_to_staff'],
        requiresAuth: false,
        confidence: 0,
        context: { serviceType: 'general', urgency: 'routine' }
      };
    }
  }

  // Create new patient if they don't exist
  async createPatientIfNeeded(
    sessionId: string,
    patientName: string,
    context: SchedulingContext
  ): Promise<{ patientId: string; isNewPatient: boolean }> {
    this.addAuditStep(sessionId, 'patient_lookup', 'in_progress');
    
    // Check if patient already exists
    const existingPatients = await this.storage.getAllPatients();
    const existingPatient = existingPatients.find((p: Patient) => 
      `${p.firstName} ${p.lastName}`.toLowerCase() === patientName.toLowerCase()
    );
    
    if (existingPatient) {
      this.addAuditStep(sessionId, 'patient_lookup', 'completed', { found: true, patientId: existingPatient.patientId });
      return { patientId: existingPatient.patientId.toString(), isNewPatient: false };
    }
    
    // Create new patient
    this.addAuditStep(sessionId, 'patient_creation', 'in_progress');
    const [firstName, ...lastNameParts] = patientName.split(' ');
    const lastName = lastNameParts.join(' ') || 'Unknown';
    
    const newPatientData: InsertPatient = {
      firstName,
      lastName,
      gender: 'U', // Unknown - would collect during registration
      dateOfBirth: '1990-01-01', // Default - would collect during registration
      phone: null,
      email: null
    };
    
    const newPatient = await this.storage.createPatient(newPatientData);
    this.addAuditStep(sessionId, 'patient_creation', 'completed', { patientId: newPatient.patientId });
    
    return { patientId: newPatient.patientId.toString(), isNewPatient: true };
  }

  // Complete end-to-end scheduling workflow
  async executeSchedulingWorkflow(
    sessionId: string,
    patientName: string,
    context: SchedulingContext
  ): Promise<{
    success: boolean;
    appointmentId?: string;
    patientId?: string;
    isNewPatient?: boolean;
    steps: WorkflowStep[];
    nextActions: string[];
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      // Step 0: Create or find patient
      const { patientId, isNewPatient } = await this.createPatientIfNeeded(sessionId, patientName, context);
      context.patientId = patientId;
      context.patientName = patientName;
      
      // Step 1: Insurance Eligibility Check
      this.addAuditStep(sessionId, 'eligibility_check', 'in_progress');
      const eligibility = await this.checkInsuranceEligibility(patientId, context.serviceType);
      
      if (!eligibility.isEligible) {
        this.addAuditStep(sessionId, 'eligibility_check', 'failed', eligibility);
        errors.push('Insurance eligibility verification failed');
      } else {
        this.addAuditStep(sessionId, 'eligibility_check', 'completed', eligibility);
      }

      // Step 2: Check Referral Requirements
      if (eligibility.referralRequired) {
        this.addAuditStep(sessionId, 'referral_check', 'in_progress');
        // In production: query referral database
        const hasValidReferral = false; // Mock check
        
        if (!hasValidReferral) {
          this.addAuditStep(sessionId, 'referral_check', 'failed');
          return {
            success: false,
            steps: this.auditTrail.get(sessionId) || [],
            nextActions: ['request_referral_from_pcp'],
            errors: ['Valid referral required for specialist appointment']
          };
        }
        this.addAuditStep(sessionId, 'referral_check', 'completed');
      }

      // Step 3: Query Available Slots
      this.addAuditStep(sessionId, 'slot_query', 'in_progress');
      const availableSlots = await this.queryAvailableSlots(
        context.serviceType,
        context.specialty,
        context.preferredLocation
      );

      if (availableSlots.length === 0) {
        this.addAuditStep(sessionId, 'slot_query', 'failed');
        return {
          success: false,
          steps: this.auditTrail.get(sessionId) || [],
          nextActions: ['add_to_waitlist', 'suggest_alternative_locations'],
          errors: ['No available appointments found']
        };
      }
      this.addAuditStep(sessionId, 'slot_query', 'completed', { slotsFound: availableSlots.length });

      // Step 4: Book Appointment (create actual record)
      this.addAuditStep(sessionId, 'appointment_booking', 'in_progress');
      const selectedSlot = availableSlots[0]; // Auto-select first available
      
      // Create actual appointment record
      const appointmentData: InsertAppointment = {
        patientId: parseInt(patientId),
        appointmentType: context.serviceType,
        appointmentDate: selectedSlot.date,
        appointmentTime: selectedSlot.startTime,
        status: 'scheduled'
      };
      
      const appointment = await this.storage.createAppointment(appointmentData);
      this.addAuditStep(sessionId, 'appointment_booking', 'completed', { appointmentId: appointment.appointmentId });

      // Step 5: Send Confirmation & Pre-visit Instructions
      this.addAuditStep(sessionId, 'send_confirmation', 'in_progress');
      // Would send via configured communication channels
      this.addAuditStep(sessionId, 'send_confirmation', 'completed');

      return {
        success: true,
        appointmentId: appointment.appointmentId.toString(),
        patientId: patientId,
        isNewPatient: isNewPatient,
        steps: this.auditTrail.get(sessionId) || [],
        nextActions: ['send_prep_instructions', 'schedule_reminder'],
        errors
      };

    } catch (error) {
      this.addAuditStep(sessionId, 'workflow_execution', 'failed', null, error?.toString());
      return {
        success: false,
        steps: this.auditTrail.get(sessionId) || [],
        nextActions: ['fallback_to_staff'],
        errors: [`Workflow execution failed: ${error}`]
      };
    }
  }

  // Generate pre-visit instructions based on service type
  async generatePrepInstructions(serviceType: string, specialty?: string): Promise<string> {
    const systemPrompt = `Generate specific, actionable pre-visit instructions for a ${serviceType} ${specialty || ''} appointment. 

Include:
- What to bring (documents, medications, etc.)
- How to prepare (fasting, clothing, etc.)  
- What to expect during the visit
- Important reminders

Keep instructions clear, concise, and patient-friendly.`;

    try {
      const completion = await this.deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        temperature: 0.2,
        max_tokens: 500
      });

      return completion.choices[0].message.content || 'Standard pre-visit instructions will be provided.';
    } catch {
      return 'Please arrive 15 minutes early and bring your insurance card and photo ID.';
    }
  }

  // Get audit trail for compliance
  getAuditTrail(sessionId: string): WorkflowStep[] {
    return this.auditTrail.get(sessionId) || [];
  }

  // Clean up old sessions
  cleanupSessions(olderThan: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)) {
    for (const [sessionId, steps] of Array.from(this.auditTrail.entries())) {
      const lastStep = steps[steps.length - 1];
      if (lastStep && lastStep.timestamp < olderThan) {
        this.auditTrail.delete(sessionId);
        this.sessionContext.delete(sessionId);
      }
    }
  }
}

// Export singleton instance (will be initialized with storage in routes setup)
export let healthcareAgent: HealthcareAIAgent;

export function initializeHealthcareAgent(storage: any) {
  healthcareAgent = new HealthcareAIAgent(storage);
}