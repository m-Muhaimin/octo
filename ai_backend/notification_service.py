import os
import asyncio
import schedule
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
from dataclasses import dataclass
import httpx

@dataclass
class NotificationTemplate:
    id: str
    type: str  # "appointment_reminder", "billing_reminder", "follow_up"
    channel: str  # "sms", "email", "voice"
    template: str
    variables: List[str]

class NotificationService:
    def __init__(self):
        self.twilio_client = None
        self.sendgrid_client = None
        self.scheduled_notifications = {}
        self.templates = self._load_templates()
        
    async def initialize(self):
        """Initialize notification service"""
        print("📱 Initializing notification service...")
        
        # Initialize Twilio for SMS/Voice
        self.twilio_account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")
        
        # Initialize SendGrid for email
        self.sendgrid_api_key = os.getenv("SENDGRID_API_KEY")
        
    def _load_templates(self) -> Dict[str, NotificationTemplate]:
        """Load notification templates"""
        
        return {
            "appointment_reminder_sms": NotificationTemplate(
                id="appointment_reminder_sms",
                type="appointment_reminder",
                channel="sms",
                template="Hi {patient_name}, this is a reminder for your appointment with {provider} on {date} at {time}. Reply CANCEL to reschedule. - {practice_name}",
                variables=["patient_name", "provider", "date", "time", "practice_name"]
            ),
            "appointment_reminder_email": NotificationTemplate(
                id="appointment_reminder_email",
                type="appointment_reminder", 
                channel="email",
                template="""
                <h2>Appointment Reminder</h2>
                <p>Dear {patient_name},</p>
                <p>This is a friendly reminder about your upcoming appointment:</p>
                <ul>
                    <li><strong>Date:</strong> {date}</li>
                    <li><strong>Time:</strong> {time}</li>
                    <li><strong>Provider:</strong> {provider}</li>
                    <li><strong>Location:</strong> {location}</li>
                </ul>
                <p>If you need to reschedule or cancel, please call us at {phone} or reply to this email.</p>
                <p>Best regards,<br>{practice_name}</p>
                """,
                variables=["patient_name", "date", "time", "provider", "location", "phone", "practice_name"]
            ),
            "billing_reminder_email": NotificationTemplate(
                id="billing_reminder_email",
                type="billing_reminder",
                channel="email",
                template="""
                <h2>Payment Reminder</h2>
                <p>Dear {patient_name},</p>
                <p>We hope you're doing well. This is a friendly reminder about your outstanding balance:</p>
                <ul>
                    <li><strong>Invoice #:</strong> {invoice_id}</li>
                    <li><strong>Amount Due:</strong> ${amount}</li>
                    <li><strong>Due Date:</strong> {due_date}</li>
                    <li><strong>Days Overdue:</strong> {days_overdue}</li>
                </ul>
                <p>Please visit our patient portal or call us at {phone} to make a payment.</p>
                <p>We offer payment plans if you need assistance.</p>
                <p>Thank you,<br>{practice_name}</p>
                """,
                variables=["patient_name", "invoice_id", "amount", "due_date", "days_overdue", "phone", "practice_name"]
            ),
            "no_show_followup": NotificationTemplate(
                id="no_show_followup",
                type="follow_up",
                channel="sms",
                template="Hi {patient_name}, we missed you at your appointment today. Please call {phone} to reschedule. Your health is important to us. - {practice_name}",
                variables=["patient_name", "phone", "practice_name"]
            )
        }
    
    async def schedule_reminder(self, appointment_id: str, reminder_type: str, 
                              schedule_time: Optional[datetime] = None):
        """Schedule an appointment reminder"""
        
        # Get appointment data (mock for development)
        appointment_data = await self._get_appointment_data(appointment_id)
        
        if not schedule_time:
            # Default to 24 hours before appointment
            appointment_datetime = datetime.fromisoformat(appointment_data["datetime"])
            schedule_time = appointment_datetime - timedelta(hours=24)
        
        reminder_id = f"REM-{appointment_id}-{reminder_type}"
        
        # Store scheduled reminder
        self.scheduled_notifications[reminder_id] = {
            "type": "appointment_reminder",
            "channel": reminder_type,
            "appointment_id": appointment_id,
            "schedule_time": schedule_time.isoformat(),
            "data": appointment_data,
            "status": "scheduled"
        }
        
        # Schedule the actual reminder
        await self._schedule_notification(reminder_id, schedule_time)
        
        print(f"📅 Scheduled {reminder_type} reminder for appointment {appointment_id}")
        
    async def send_billing_reminder(self, invoice_id: str, days_overdue: int, 
                                  reminder_type: str = "gentle"):
        """Send billing reminder"""
        
        # Get billing data (mock for development)
        billing_data = await self._get_billing_data(invoice_id)
        
        # Select template based on reminder type
        if reminder_type == "gentle" and days_overdue <= 30:
            template_id = "billing_reminder_email"
        elif reminder_type == "firm" and days_overdue <= 60:
            template_id = "billing_reminder_email"
        else:
            template_id = "billing_reminder_email"  # Could have different templates
        
        # Send reminder
        await self._send_notification(
            template_id=template_id,
            recipient_data=billing_data,
            context={
                "invoice_id": invoice_id,
                "days_overdue": days_overdue,
                "reminder_type": reminder_type
            }
        )
        
        print(f"💰 Sent {reminder_type} billing reminder for invoice {invoice_id}")
    
    async def send_no_show_followup(self, appointment_id: str):
        """Send no-show follow-up message"""
        
        appointment_data = await self._get_appointment_data(appointment_id)
        
        await self._send_notification(
            template_id="no_show_followup",
            recipient_data=appointment_data,
            context={"appointment_id": appointment_id}
        )
        
        print(f"👻 Sent no-show follow-up for appointment {appointment_id}")
    
    async def _schedule_notification(self, reminder_id: str, schedule_time: datetime):
        """Schedule a notification for future delivery"""
        
        # Calculate delay
        delay_seconds = (schedule_time - datetime.now()).total_seconds()
        
        if delay_seconds > 0:
            # Schedule for future delivery
            asyncio.create_task(self._delayed_notification(reminder_id, delay_seconds))
        else:
            # Send immediately
            await self._execute_scheduled_notification(reminder_id)
    
    async def _delayed_notification(self, reminder_id: str, delay_seconds: float):
        """Execute notification after delay"""
        await asyncio.sleep(delay_seconds)
        await self._execute_scheduled_notification(reminder_id)
    
    async def _execute_scheduled_notification(self, reminder_id: str):
        """Execute a scheduled notification"""
        
        if reminder_id not in self.scheduled_notifications:
            return
        
        notification = self.scheduled_notifications[reminder_id]
        
        # Determine template
        if notification["type"] == "appointment_reminder":
            template_id = f"appointment_reminder_{notification['channel']}"
        else:
            template_id = notification["type"]
        
        # Send notification
        await self._send_notification(
            template_id=template_id,
            recipient_data=notification["data"],
            context={"reminder_id": reminder_id}
        )
        
        # Update status
        notification["status"] = "sent"
        notification["sent_time"] = datetime.now().isoformat()
    
    async def _send_notification(self, template_id: str, recipient_data: Dict, context: Dict):
        """Send notification using specified template"""
        
        template = self.templates.get(template_id)
        if not template:
            raise Exception(f"Template {template_id} not found")
        
        # Render template
        message = self._render_template(template, recipient_data, context)
        
        # Send via appropriate channel
        if template.channel == "sms" and recipient_data.get("phone"):
            await self._send_sms(recipient_data.get("phone", ""), message)
        elif template.channel == "email" and recipient_data.get("email"):
            await self._send_email(
                recipient_data.get("email", ""),
                f"Message from {recipient_data.get('practice_name', 'Medical Practice')}",
                message
            )
        elif template.channel == "voice" and recipient_data.get("phone"):
            await self._send_voice_call(recipient_data.get("phone", ""), message)
    
    def _render_template(self, template: NotificationTemplate, 
                        recipient_data: Dict, context: Dict) -> str:
        """Render notification template with data"""
        
        # Combine all data sources
        render_data = {
            **recipient_data,
            **context,
            "practice_name": "Medisight Medical Practice",
            "phone": "(555) 123-4567"
        }
        
        # Simple template rendering
        message = template.template
        for key, value in render_data.items():
            message = message.replace(f"{{{key}}}", str(value))
        
        return message
    
    async def _send_sms(self, phone_number: str, message: str):
        """Send SMS via Twilio"""
        
        if not self.twilio_account_sid:
            print(f"📱 SMS (mock): {phone_number} - {message}")
            return
        
        # In production, use actual Twilio client
        print(f"📱 SMS sent to {phone_number}: {message[:50]}...")
    
    async def _send_email(self, email: str, subject: str, message: str):
        """Send email via SendGrid"""
        
        if not self.sendgrid_api_key:
            print(f"📧 Email (mock): {email} - {subject}")
            return
        
        # In production, use actual SendGrid client
        print(f"📧 Email sent to {email}: {subject}")
    
    async def _send_voice_call(self, phone_number: str, message: str):
        """Send voice call via Twilio"""
        
        if not self.twilio_account_sid:
            print(f"📞 Voice call (mock): {phone_number} - {message}")
            return
        
        # In production, use actual Twilio voice API
        print(f"📞 Voice call made to {phone_number}")
    
    async def _get_appointment_data(self, appointment_id: str) -> Dict[str, Any]:
        """Get appointment data (mock implementation)"""
        
        return {
            "patient_name": "John Doe",
            "provider": "Dr. Smith",
            "date": "August 20, 2024",
            "time": "10:00 AM",
            "location": "Main Office",
            "phone": "555-123-4567",
            "email": "john.doe@email.com",
            "datetime": "2024-08-20T10:00:00"
        }
    
    async def _get_billing_data(self, invoice_id: str) -> Dict[str, Any]:
        """Get billing data (mock implementation)"""
        
        return {
            "patient_name": "John Doe",
            "email": "john.doe@email.com",
            "amount": "250.00",
            "due_date": "August 15, 2024",
            "phone": "555-123-4567"
        }
    
    async def get_notification_stats(self) -> Dict[str, Any]:
        """Get notification statistics"""
        
        total_sent = len([n for n in self.scheduled_notifications.values() 
                         if n.get("status") == "sent"])
        total_scheduled = len(self.scheduled_notifications)
        
        return {
            "total_notifications": total_scheduled,
            "sent_notifications": total_sent,
            "pending_notifications": total_scheduled - total_sent,
            "delivery_rate": round((total_sent / total_scheduled * 100) if total_scheduled > 0 else 0, 1),
            "channels": {
                "sms": len([n for n in self.scheduled_notifications.values() 
                           if n.get("channel") == "sms"]),
                "email": len([n for n in self.scheduled_notifications.values() 
                             if n.get("channel") == "email"]),
                "voice": len([n for n in self.scheduled_notifications.values() 
                             if n.get("channel") == "voice"])
            }
        }