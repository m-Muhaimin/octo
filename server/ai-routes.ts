import { Router } from 'express';
import type { Request, Response } from 'express';
import { healthcareAgent } from './ai-agent-deepseek';
import { z } from 'zod';

const router = Router();

// Validation schemas
const messageSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
  channel: z.enum(['sms', 'web', 'phone', 'email']).default('web'),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  patientId: z.string().optional()
});

const eligibilitySchema = z.object({
  patientId: z.string(),
  serviceType: z.string()
});

const schedulingSchema = z.object({
  sessionId: z.string(),
  patientName: z.string(),
  serviceType: z.string(),
  specialty: z.string().optional(),
  urgency: z.enum(['routine', 'urgent', 'stat']).default('routine'),
  preferredLocation: z.string().optional(),
  preferredProvider: z.string().optional()
});

// AI Healthcare Admin Agent - Main conversation endpoint  
router.post('/ai/chat', async (req: Request, res: Response) => {
  try {
    const validation = messageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request parameters',
        errors: validation.error.issues
      });
    }

    const { message, sessionId, channel, phoneNumber, email } = validation.data;
    const finalSessionId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = await healthcareAgent.processPatientMessage(
      finalSessionId,
      message,
      channel,
      phoneNumber,
      email
    );

    res.json({
      status: 'success',
      sessionId: finalSessionId,
      response: result.response,
      actions: result.actions,
      requiresAuth: result.requiresAuth,
      nextStep: result.nextStep,
      confidence: result.confidence,
      context: result.context
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error processing your message',
      fallbackResponse: "I'm having trouble processing your request. Please call our office at (555) 123-4567 for immediate assistance."
    });
  }
});

// Insurance eligibility check (FHIR R4 270/271)
router.post('/ai/eligibility', async (req: Request, res: Response) => {
  try {
    const validation = eligibilitySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request parameters',
        errors: validation.error.issues
      });
    }

    const { patientId, serviceType } = validation.data;
    const eligibility = await healthcareAgent.checkInsuranceEligibility(patientId, serviceType);

    res.json({
      status: 'success',
      eligibility
    });

  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check insurance eligibility'
    });
  }
});

// Execute complete scheduling workflow
router.post('/ai/schedule', async (req: Request, res: Response) => {
  try {
    const validation = schedulingSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid scheduling parameters',
        errors: validation.error.issues
      });
    }

    const { sessionId, patientName, serviceType, specialty, urgency, preferredLocation, preferredProvider } = validation.data;
    
    const context = {
      serviceType,
      specialty,
      urgency,
      preferredLocation,
      preferredProvider
    };

    const result = await healthcareAgent.executeSchedulingWorkflow(sessionId, patientName, context);

    res.json({
      status: result.success ? 'success' : 'failed',
      result
    });

  } catch (error) {
    console.error('Scheduling workflow error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to execute scheduling workflow'
    });
  }
});

// Get available appointment slots
router.get('/ai/slots', async (req: Request, res: Response) => {
  try {
    const serviceType = req.query.serviceType as string || 'general';
    const specialty = req.query.specialty as string;
    const location = req.query.location as string;

    const slots = await healthcareAgent.queryAvailableSlots(serviceType, specialty, location);

    res.json({
      status: 'success',
      slots
    });

  } catch (error) {
    console.error('Slot query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to query available slots'
    });
  }
});

// Generate pre-visit instructions
router.post('/ai/prep-instructions', async (req: Request, res: Response) => {
  try {
    const { serviceType, specialty } = req.body;
    
    if (!serviceType) {
      return res.status(400).json({
        status: 'error',
        message: 'Service type is required'
      });
    }

    const instructions = await healthcareAgent.generatePrepInstructions(serviceType, specialty);

    res.json({
      status: 'success',
      instructions
    });

  } catch (error) {
    console.error('Prep instructions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate prep instructions'
    });
  }
});

// Get session audit trail
router.get('/ai/audit/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const auditTrail = healthcareAgent.getAuditTrail(sessionId);

    res.json({
      status: 'success',
      sessionId,
      auditTrail
    });

  } catch (error) {
    console.error('Audit trail error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve audit trail'
    });
  }
});

// Legacy endpoint for backward compatibility
router.post('/ai/query', async (req: Request, res: Response) => {
  const { query } = req.body;
  
  try {
    const sessionId = `legacy-${Date.now()}`;
    const result = await healthcareAgent.processPatientMessage(sessionId, query, 'web');

    res.json({
      status: 'success',
      response: {
        answer: result.response,
        confidence: result.confidence,
        sources: ['DeepSeek AI', 'Medical Knowledge Base', 'Practice Data'],
        actionable: result.actions.length > 0
      }
    });

  } catch (error) {
    console.error('Legacy query error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process query'
    });
  }
});

router.get('/ai/analytics', async (req: Request, res: Response) => {
  res.json({
    status: 'success',
    analytics: {
      claim_success_rate: 94.2,
      average_processing_time: '3.2 days',
      denial_rate: 5.8,
      top_denial_reasons: [
        { reason: 'Medical necessity', percentage: 35 },
        { reason: 'Incorrect coding', percentage: 28 },
        { reason: 'Prior authorization', percentage: 22 },
        { reason: 'Documentation', percentage: 15 }
      ],
      revenue_forecast: {
        next_month: 138000,
        confidence: 87
      },
      patient_satisfaction: 4.6,
      automation_savings: {
        time_saved_hours: 120,
        cost_savings: 4800
      }
    }
  });
});

router.get('/ai/predictions', async (req: Request, res: Response) => {
  res.json({
    status: 'success',
    predictions: {
      patient_flow: {
        next_week_appointments: 145,
        predicted_no_shows: 12,
        optimal_scheduling_slots: ['9:00 AM', '2:00 PM', '4:00 PM']
      },
      revenue_predictions: {
        monthly_revenue: 138000,
        collections_rate: 96.5,
        outstanding_claims_resolution: '14 days'
      },
      operational_insights: {
        staff_efficiency: 92,
        system_utilization: 88,
        patient_wait_time: '8 minutes'
      }
    }
  });
});

router.get('/ehr/systems', async (req: Request, res: Response) => {
  res.json({
    systems: [
      { id: 'athenahealth', name: 'athenahealth', status: 'active' },
      { id: 'drchrono', name: 'DrChrono', status: 'active' },
      { id: 'epic', name: 'Epic', status: 'beta' },
      { id: 'cerner', name: 'Cerner', status: 'planned' }
    ]
  });
});

router.post('/ehr/sync-patient', async (req: Request, res: Response) => {
  const { patient_id, ehr_system = 'athenahealth' } = req.body;
  
  // Simulate sync process
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  res.json({
    status: 'success',
    data: {
      patient_id,
      ehr_system,
      sync_timestamp: new Date().toISOString(),
      records_synced: Math.floor(Math.random() * 50) + 10,
      status: 'completed'
    }
  });
});

router.post('/insurance/submit-claim', async (req: Request, res: Response) => {
  const claimData = req.body;
  
  // Simulate claim submission
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const claimId = `CLM-${Date.now()}`;
  
  res.json({
    status: 'submitted',
    claim_id: claimId,
    ai_analysis: {
      approval_likelihood: Math.floor(Math.random() * 30) + 70, // 70-100%
      risk_factors: ['Documentation complete', 'Prior authorization verified'],
      recommendations: ['Submit within 24 hours', 'Include supporting documentation']
    }
  });
});

router.get('/insurance/claim-status/:claimId', async (req: Request, res: Response) => {
  const { claimId } = req.params;
  
  const statuses = ['submitted', 'processing', 'approved', 'paid'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  res.json({
    status: 'success',
    claim_status: {
      claim_id: claimId,
      status: randomStatus,
      submitted_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      last_updated: new Date().toISOString(),
      amount: '$' + (Math.random() * 1000 + 100).toFixed(2)
    }
  });
});

router.post('/notifications/schedule-reminder', async (req: Request, res: Response) => {
  const { appointment_id, reminder_type, schedule_time } = req.body;
  
  res.json({
    status: 'scheduled',
    reminder_id: `REM-${appointment_id}-${reminder_type}`,
    scheduled_for: schedule_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
});

router.post('/billing/follow-up', async (req: Request, res: Response) => {
  const { invoice_id, days_overdue, follow_up_type } = req.body;
  
  res.json({
    status: 'scheduled',
    followup_id: `FU-${invoice_id}`,
    follow_up_type,
    scheduled_for: new Date().toISOString()
  });
});

export default router;