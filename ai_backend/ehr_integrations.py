import os
import httpx
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import json
import base64

class EHRManager:
    def __init__(self):
        self.supported_systems = {
            "athenahealth": AthenaHealthAPI(),
            "drchrono": DrChronoAPI(),
            "epic": EpicAPI(),
            "cerner": CernerAPI()
        }
        self.active_connections = {}
    
    async def initialize(self):
        """Initialize EHR connections"""
        for system_name, api in self.supported_systems.items():
            try:
                await api.authenticate()
                self.active_connections[system_name] = api
                print(f"✅ {system_name} EHR connection established")
            except Exception as e:
                print(f"⚠️ {system_name} EHR connection failed: {e}")
    
    async def sync_patient(self, patient_id: str, ehr_system: str = "athenahealth") -> Dict[str, Any]:
        """Sync patient data from specified EHR system"""
        if ehr_system not in self.active_connections:
            raise Exception(f"EHR system {ehr_system} not available")
        
        api = self.active_connections[ehr_system]
        return await api.get_patient_data(patient_id)
    
    async def create_appointment(self, appointment_data: Dict, ehr_system: str = "athenahealth") -> Dict[str, Any]:
        """Create appointment in EHR system"""
        if ehr_system not in self.active_connections:
            raise Exception(f"EHR system {ehr_system} not available")
        
        api = self.active_connections[ehr_system]
        return await api.create_appointment(appointment_data)
    
    async def health_check(self) -> str:
        """Check health of EHR connections"""
        if len(self.active_connections) > 0:
            return "healthy"
        return "unhealthy"

class AthenaHealthAPI:
    def __init__(self):
        self.base_url = "https://api.athenahealth.com"
        self.client_id = os.getenv("ATHENA_CLIENT_ID")
        self.client_secret = os.getenv("ATHENA_CLIENT_SECRET")
        self.access_token = None
        self.practice_id = os.getenv("ATHENA_PRACTICE_ID", "195900")
    
    async def authenticate(self):
        """Authenticate with athenahealth API"""
        if not self.client_id or not self.client_secret:
            # Use sandbox credentials for development
            self.client_id = "sandbox_client_id"
            self.client_secret = "sandbox_client_secret"
            self.access_token = "sandbox_token"
            return
        
        auth_url = f"{self.base_url}/oauth2/v1/token"
        
        # Create basic auth header
        credentials = f"{self.client_id}:{self.client_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {"grant_type": "client_credentials", "scope": "athenahealth/service/Athenahealth.MDP.*"}
        
        async with httpx.AsyncClient() as client:
            response = await client.post(auth_url, headers=headers, data=data)
            if response.status_code == 200:
                token_data = response.json()
                self.access_token = token_data["access_token"]
            else:
                raise Exception(f"Authentication failed: {response.text}")
    
    async def get_patient_data(self, patient_id: str) -> Dict[str, Any]:
        """Get comprehensive patient data from athenahealth"""
        
        if not self.access_token:
            # Return mock data for development
            return {
                "patient_id": patient_id,
                "demographics": {
                    "first_name": "John",
                    "last_name": "Doe",
                    "dob": "1985-06-15",
                    "gender": "M",
                    "phone": "555-0123",
                    "email": "john.doe@email.com",
                    "address": {
                        "street": "123 Main St",
                        "city": "Anytown",
                        "state": "CA",
                        "zip": "90210"
                    }
                },
                "insurance": {
                    "primary": {
                        "payer_name": "Blue Cross Blue Shield",
                        "policy_number": "123456789",
                        "group_number": "GRP001"
                    }
                },
                "appointments": [
                    {
                        "date": "2024-08-20",
                        "time": "10:00",
                        "provider": "Dr. Smith",
                        "type": "Annual Physical"
                    }
                ],
                "last_sync": datetime.now().isoformat()
            }
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        # Get patient demographics
        patient_url = f"{self.base_url}/v1/{self.practice_id}/patients/{patient_id}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(patient_url, headers=headers)
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Failed to get patient data: {response.text}")
    
    async def create_appointment(self, appointment_data: Dict) -> Dict[str, Any]:
        """Create appointment in athenahealth"""
        
        if not self.access_token:
            # Return mock response for development
            return {
                "appointment_id": f"APPT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "status": "scheduled",
                "created_at": datetime.now().isoformat()
            }
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        appointments_url = f"{self.base_url}/v1/{self.practice_id}/appointments"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(appointments_url, headers=headers, json=appointment_data)
            if response.status_code == 201:
                return response.json()
            else:
                raise Exception(f"Failed to create appointment: {response.text}")

class DrChronoAPI:
    def __init__(self):
        self.base_url = "https://app.drchrono.com/api"
        self.client_id = os.getenv("DRCHRONO_CLIENT_ID")
        self.client_secret = os.getenv("DRCHRONO_CLIENT_SECRET")
        self.access_token = None
    
    async def authenticate(self):
        """Authenticate with DrChrono API"""
        # Implement OAuth2 flow for DrChrono
        self.access_token = "drchrono_sandbox_token"
    
    async def get_patient_data(self, patient_id: str) -> Dict[str, Any]:
        """Get patient data from DrChrono"""
        # Mock implementation
        return {
            "source": "drchrono",
            "patient_id": patient_id,
            "status": "sandbox_mode"
        }
    
    async def create_appointment(self, appointment_data: Dict) -> Dict[str, Any]:
        """Create appointment in DrChrono"""
        return {"status": "sandbox_mode", "source": "drchrono"}

class EpicAPI:
    def __init__(self):
        self.base_url = "https://fhir.epic.com/interconnect-fhir-oauth"
        self.client_id = os.getenv("EPIC_CLIENT_ID")
        self.access_token = None
    
    async def authenticate(self):
        """Authenticate with Epic FHIR API"""
        # Implement FHIR OAuth2 flow
        self.access_token = "epic_sandbox_token"
    
    async def get_patient_data(self, patient_id: str) -> Dict[str, Any]:
        """Get patient data from Epic using FHIR"""
        return {
            "source": "epic",
            "patient_id": patient_id,
            "status": "beta_mode"
        }
    
    async def create_appointment(self, appointment_data: Dict) -> Dict[str, Any]:
        """Create appointment in Epic"""
        return {"status": "beta_mode", "source": "epic"}

class CernerAPI:
    def __init__(self):
        self.base_url = "https://fhir-open.cerner.com"
        self.access_token = None
    
    async def authenticate(self):
        """Authenticate with Cerner FHIR API"""
        # Implement FHIR authentication
        self.access_token = "cerner_token"
    
    async def get_patient_data(self, patient_id: str) -> Dict[str, Any]:
        """Get patient data from Cerner"""
        return {
            "source": "cerner",
            "patient_id": patient_id,
            "status": "planned"
        }
    
    async def create_appointment(self, appointment_data: Dict) -> Dict[str, Any]:
        """Create appointment in Cerner"""
        return {"status": "planned", "source": "cerner"}