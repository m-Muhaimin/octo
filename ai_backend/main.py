from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
import httpx
from datetime import datetime, timedelta
from contextlib import asynccontextmanager

from ai_agent import MedicalAIAgent
from ehr_integrations import EHRManager
from insurance_processor import InsuranceProcessor
from notification_service import NotificationService
from billing_automation import BillingAutomation

# Initialize AI agent and services
ai_agent = MedicalAIAgent()
ehr_manager = EHRManager()
insurance_processor = InsuranceProcessor()
notification_service = NotificationService()
billing_automation = BillingAutomation()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await ai_agent.initialize()
    await ehr_manager.initialize()
    print("🤖 AI Medical Agent initialized")
    yield
    # Shutdown
    await ai_agent.cleanup()

app = FastAPI(
    title="Medical AI Agent API",
    description="Production-ready AI agent for medical practice management with EHR integration",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Pydantic models
class PatientRequest(BaseModel):
    patient_id: str
    ehr_system: Optional[str] = "athenahealth"

class InsuranceClaimRequest(BaseModel):
    patient_id: str
    procedure_codes: List[str]
    diagnosis_codes: List[str]
    service_date: datetime
    provider_info: Dict[str, Any]

class AppointmentReminderRequest(BaseModel):
    appointment_id: str
    reminder_type: str  # "sms", "email", "call"
    schedule_time: Optional[datetime] = None

class BillingFollowupRequest(BaseModel):
    invoice_id: str
    days_overdue: int
    follow_up_type: str  # "gentle", "firm", "final_notice"

class AIQueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None
    patient_id: Optional[str] = None

# Authentication
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    # In production, implement proper JWT validation
    if not token or token != os.getenv("API_TOKEN", "dev-token"):
        raise HTTPException(status_code=401, detail="Invalid token")
    return token

# EHR Integration Endpoints
@app.post("/api/ehr/sync-patient")
async def sync_patient_data(
    request: PatientRequest,
    token: str = Depends(verify_token)
):
    """Sync patient data from EHR system"""
    try:
        patient_data = await ehr_manager.sync_patient(
            patient_id=request.patient_id,
            ehr_system=request.ehr_system or "athenahealth"
        )
        return {"status": "success", "data": patient_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ehr/systems")
async def get_supported_ehr_systems(token: str = Depends(verify_token)):
    """Get list of supported EHR systems"""
    return {
        "systems": [
            {"id": "athenahealth", "name": "athenahealth", "status": "active"},
            {"id": "drchrono", "name": "DrChrono", "status": "active"},
            {"id": "epic", "name": "Epic", "status": "beta"},
            {"id": "cerner", "name": "Cerner", "status": "planned"}
        ]
    }

# AI Agent Endpoints
@app.post("/api/ai/query")
async def query_ai_agent(
    request: AIQueryRequest,
    token: str = Depends(verify_token)
):
    """Query the AI agent for medical insights, policy questions, or automation suggestions"""
    try:
        response = await ai_agent.process_query(
            query=request.query,
            context=request.context,
            patient_id=request.patient_id
        )
        return {"status": "success", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/analyze-claim")
async def analyze_insurance_claim(
    request: InsuranceClaimRequest,
    token: str = Depends(verify_token)
):
    """AI analysis of insurance claim for accuracy and approval likelihood"""
    try:
        analysis = await ai_agent.analyze_claim(
            patient_id=request.patient_id,
            procedure_codes=request.procedure_codes,
            diagnosis_codes=request.diagnosis_codes,
            service_date=request.service_date
        )
        return {"status": "success", "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Insurance Automation Endpoints
@app.post("/api/insurance/submit-claim")
async def submit_insurance_claim(
    request: InsuranceClaimRequest,
    background_tasks: BackgroundTasks,
    token: str = Depends(verify_token)
):
    """Submit insurance claim with AI pre-processing"""
    try:
        # AI pre-analysis
        analysis = await ai_agent.analyze_claim(
            patient_id=request.patient_id,
            procedure_codes=request.procedure_codes,
            diagnosis_codes=request.diagnosis_codes,
            service_date=request.service_date
        )
        
        # Submit claim in background
        background_tasks.add_task(
            insurance_processor.submit_claim,
            request.dict(),
            analysis
        )
        
        return {
            "status": "submitted",
            "claim_id": f"CLM-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "ai_analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/insurance/claim-status/{claim_id}")
async def get_claim_status(
    claim_id: str,
    token: str = Depends(verify_token)
):
    """Get status of submitted insurance claim"""
    try:
        status = await insurance_processor.get_claim_status(claim_id)
        return {"status": "success", "claim_status": status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Notification & Reminder Endpoints
@app.post("/api/notifications/schedule-reminder")
async def schedule_appointment_reminder(
    request: AppointmentReminderRequest,
    background_tasks: BackgroundTasks,
    token: str = Depends(verify_token)
):
    """Schedule automated appointment reminder"""
    try:
        background_tasks.add_task(
            notification_service.schedule_reminder,
            appointment_id=request.appointment_id,
            reminder_type=request.reminder_type,
            schedule_time=request.schedule_time
        )
        return {"status": "scheduled", "reminder_id": f"REM-{request.appointment_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/billing/follow-up")
async def schedule_billing_followup(
    request: BillingFollowupRequest,
    background_tasks: BackgroundTasks,
    token: str = Depends(verify_token)
):
    """Schedule automated billing follow-up"""
    try:
        background_tasks.add_task(
            billing_automation.schedule_followup,
            invoice_id=request.invoice_id,
            days_overdue=request.days_overdue,
            follow_up_type=request.follow_up_type
        )
        return {"status": "scheduled", "followup_id": f"FU-{request.invoice_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Analytics & Reporting Endpoints
@app.get("/api/analytics/dashboard")
async def get_ai_analytics(token: str = Depends(verify_token)):
    """Get AI-powered analytics dashboard data"""
    try:
        analytics = await ai_agent.generate_analytics()
        return {"status": "success", "analytics": analytics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/predictions")
async def get_ai_predictions(token: str = Depends(verify_token)):
    """Get AI predictions for patient flow, revenue, etc."""
    try:
        predictions = await ai_agent.generate_predictions()
        return {"status": "success", "predictions": predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "ai_agent": await ai_agent.health_check(),
            "ehr_manager": await ehr_manager.health_check(),
            "insurance_processor": await insurance_processor.health_check()
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )