import os
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
from dataclasses import dataclass
from enum import Enum

class FollowUpType(Enum):
    GENTLE = "gentle"
    FIRM = "firm" 
    FINAL_NOTICE = "final_notice"
    COLLECTIONS = "collections"

@dataclass
class BillingRule:
    days_after_due: int
    follow_up_type: FollowUpType
    action: str
    template_id: str

class BillingAutomation:
    def __init__(self):
        self.billing_rules = self._setup_billing_rules()
        self.active_followups = {}
        self.payment_processor = PaymentProcessor()
        
    def _setup_billing_rules(self) -> List[BillingRule]:
        """Setup automated billing follow-up rules"""
        
        return [
            BillingRule(
                days_after_due=7,
                follow_up_type=FollowUpType.GENTLE,
                action="send_reminder",
                template_id="gentle_reminder"
            ),
            BillingRule(
                days_after_due=30,
                follow_up_type=FollowUpType.FIRM,
                action="send_reminder",
                template_id="firm_reminder"
            ),
            BillingRule(
                days_after_due=60,
                follow_up_type=FollowUpType.FINAL_NOTICE,
                action="send_final_notice",
                template_id="final_notice"
            ),
            BillingRule(
                days_after_due=90,
                follow_up_type=FollowUpType.COLLECTIONS,
                action="send_to_collections",
                template_id="collections_notice"
            )
        ]
    
    async def schedule_followup(self, invoice_id: str, days_overdue: int, 
                              follow_up_type: str):
        """Schedule billing follow-up based on rules"""
        
        followup_id = f"BF-{invoice_id}-{follow_up_type}"
        
        # Get invoice data
        invoice_data = await self._get_invoice_data(invoice_id)
        
        # Determine appropriate rule
        rule = self._get_applicable_rule(days_overdue, follow_up_type)
        
        if not rule:
            print(f"❌ No applicable rule for {days_overdue} days overdue")
            return
        
        # Store follow-up task
        self.active_followups[followup_id] = {
            "invoice_id": invoice_id,
            "days_overdue": days_overdue,
            "follow_up_type": follow_up_type,
            "rule": rule,
            "invoice_data": invoice_data,
            "status": "scheduled",
            "created_at": datetime.now().isoformat()
        }
        
        # Execute follow-up action
        await self._execute_followup_action(followup_id)
        
        print(f"💰 Scheduled billing follow-up: {followup_id}")
    
    def _get_applicable_rule(self, days_overdue: int, follow_up_type: str) -> Optional[BillingRule]:
        """Get the appropriate billing rule"""
        
        # Find exact match first
        for rule in self.billing_rules:
            if (rule.days_after_due <= days_overdue and 
                rule.follow_up_type.value == follow_up_type):
                return rule
        
        # Find closest match
        applicable_rules = [r for r in self.billing_rules if r.days_after_due <= days_overdue]
        if applicable_rules:
            return max(applicable_rules, key=lambda r: r.days_after_due)
        
        return None
    
    async def _execute_followup_action(self, followup_id: str):
        """Execute the follow-up action"""
        
        followup = self.active_followups.get(followup_id)
        if not followup:
            return
        
        rule = followup["rule"]
        invoice_data = followup["invoice_data"]
        
        if rule.action == "send_reminder":
            await self._send_billing_reminder(followup_id, rule.template_id)
        elif rule.action == "send_final_notice":
            await self._send_final_notice(followup_id)
        elif rule.action == "send_to_collections":
            await self._send_to_collections(followup_id)
        
        # Update status
        followup["status"] = "executed"
        followup["executed_at"] = datetime.now().isoformat()
    
    async def _send_billing_reminder(self, followup_id: str, template_id: str):
        """Send billing reminder"""
        
        followup = self.active_followups[followup_id]
        invoice_data = followup["invoice_data"]
        
        # Generate personalized reminder message
        message = await self._generate_reminder_message(invoice_data, template_id)
        
        # Send via multiple channels based on amount
        amount = float(invoice_data.get("amount", 0))
        
        if amount > 500:
            # High value - send email + phone call
            await self._send_email_reminder(invoice_data, message)
            await self._schedule_phone_call(invoice_data)
        elif amount > 100:
            # Medium value - send email
            await self._send_email_reminder(invoice_data, message)
        else:
            # Low value - send SMS
            await self._send_sms_reminder(invoice_data, message)
        
        print(f"📧 Sent billing reminder for {followup_id}")
    
    async def _send_final_notice(self, followup_id: str):
        """Send final notice before collections"""
        
        followup = self.active_followups[followup_id]
        invoice_data = followup["invoice_data"]
        
        # Generate final notice
        message = await self._generate_final_notice(invoice_data)
        
        # Always send via email for final notices
        await self._send_email_reminder(invoice_data, message)
        
        # Also send certified mail (simulate)
        await self._send_certified_mail(invoice_data, message)
        
        print(f"⚠️ Sent final notice for {followup_id}")
    
    async def _send_to_collections(self, followup_id: str):
        """Send account to collections"""
        
        followup = self.active_followups[followup_id]
        invoice_data = followup["invoice_data"]
        
        # Create collections case
        collections_id = await self._create_collections_case(invoice_data)
        
        # Notify patient of collections
        message = await self._generate_collections_notice(invoice_data, collections_id)
        await self._send_email_reminder(invoice_data, message)
        
        # Update account status
        followup["collections_id"] = collections_id
        followup["sent_to_collections"] = True
        
        print(f"🏛️ Sent to collections: {followup_id}")
    
    async def _generate_reminder_message(self, invoice_data: Dict, template_id: str) -> str:
        """Generate personalized reminder message using AI"""
        
        # In production, this would use the AI agent to generate personalized messages
        templates = {
            "gentle_reminder": """
            Dear {patient_name},
            
            We hope you're doing well. This is a friendly reminder that you have an outstanding balance of ${amount} for services provided on {service_date}.
            
            Invoice #: {invoice_id}
            Due Date: {due_date}
            Days Past Due: {days_overdue}
            
            We understand that sometimes bills can be overlooked. Please visit our patient portal or call us at (555) 123-4567 to make a payment.
            
            We also offer flexible payment plans if you need assistance.
            
            Thank you for your prompt attention to this matter.
            
            Sincerely,
            Medisight Medical Practice
            """,
            
            "firm_reminder": """
            Dear {patient_name},
            
            This is a second notice regarding your outstanding balance of ${amount} which is now {days_overdue} days past due.
            
            Invoice #: {invoice_id}
            Original Due Date: {due_date}
            
            Please remit payment immediately to avoid further collection activities. If you have questions about this bill or need to arrange a payment plan, please contact our billing department at (555) 123-4567.
            
            Prompt payment is appreciated.
            
            Medisight Medical Practice
            Billing Department
            """
        }
        
        template = templates.get(template_id, templates["gentle_reminder"])
        
        # Replace placeholders
        message = template.format(
            patient_name=invoice_data.get("patient_name", "Patient"),
            amount=invoice_data.get("amount", "0.00"),
            invoice_id=invoice_data.get("invoice_id", ""),
            due_date=invoice_data.get("due_date", ""),
            days_overdue=invoice_data.get("days_overdue", 0),
            service_date=invoice_data.get("service_date", "")
        )
        
        return message
    
    async def _generate_final_notice(self, invoice_data: Dict) -> str:
        """Generate final notice message"""
        
        return f"""
        FINAL NOTICE
        
        Dear {invoice_data.get("patient_name", "Patient")},
        
        This is your FINAL NOTICE regarding the past due balance of ${invoice_data.get("amount", "0.00")} on your account.
        
        Invoice #: {invoice_data.get("invoice_id", "")}
        Days Past Due: {invoice_data.get("days_overdue", 0)}
        
        Unless payment is received within 10 days of this notice, your account will be forwarded to our collection agency. This may result in additional collection fees and could affect your credit rating.
        
        If you have any questions or wish to arrange a payment plan, please contact us immediately at (555) 123-4567.
        
        Medisight Medical Practice
        Collections Department
        """
    
    async def _generate_collections_notice(self, invoice_data: Dict, collections_id: str) -> str:
        """Generate collections notice"""
        
        return f"""
        NOTICE OF COLLECTION ACTIVITY
        
        Dear {invoice_data.get("patient_name", "Patient")},
        
        Your account has been forwarded to our collection agency for the outstanding balance of ${invoice_data.get("amount", "0.00")}.
        
        Collection Case #: {collections_id}
        Original Invoice #: {invoice_data.get("invoice_id", "")}
        
        You may be contacted directly by our collection agency. Additional fees may apply.
        
        If you believe this notice is in error or wish to resolve this matter, please contact us immediately at (555) 123-4567.
        
        Medisight Medical Practice
        Collections Department
        """
    
    async def _send_email_reminder(self, invoice_data: Dict, message: str):
        """Send email reminder"""
        
        email = invoice_data.get("email")
        if not email:
            print("❌ No email address for patient")
            return
        
        # Mock email sending
        print(f"📧 Email sent to {email}: Payment Reminder")
    
    async def _send_sms_reminder(self, invoice_data: Dict, message: str):
        """Send SMS reminder"""
        
        phone = invoice_data.get("phone")
        if not phone:
            print("❌ No phone number for patient")
            return
        
        # Mock SMS sending
        print(f"📱 SMS sent to {phone}: Payment reminder")
    
    async def _schedule_phone_call(self, invoice_data: Dict):
        """Schedule phone call for high-value accounts"""
        
        phone = invoice_data.get("phone")
        if not phone:
            return
        
        # Mock phone call scheduling
        print(f"📞 Phone call scheduled for {phone}")
    
    async def _send_certified_mail(self, invoice_data: Dict, message: str):
        """Send certified mail (simulated)"""
        
        address = invoice_data.get("address", "No address on file")
        print(f"📮 Certified mail sent to: {address}")
    
    async def _create_collections_case(self, invoice_data: Dict) -> str:
        """Create collections case"""
        
        collections_id = f"COL-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Mock collections case creation
        print(f"🏛️ Collections case created: {collections_id}")
        
        return collections_id
    
    async def _get_invoice_data(self, invoice_id: str) -> Dict[str, Any]:
        """Get invoice data (mock implementation)"""
        
        # In production, this would fetch from database
        return {
            "invoice_id": invoice_id,
            "patient_name": "John Doe",
            "email": "john.doe@email.com",
            "phone": "555-123-4567",
            "address": "123 Main St, Anytown, CA 90210",
            "amount": "250.00",
            "due_date": "2024-07-15",
            "service_date": "2024-06-15",
            "days_overdue": 35,
            "service_description": "Annual Physical Exam"
        }
    
    async def process_payment(self, invoice_id: str, payment_data: Dict) -> Dict[str, Any]:
        """Process payment and update follow-up status"""
        
        # Process payment
        payment_result = await self.payment_processor.process_payment(payment_data)
        
        if payment_result.get("status") == "success":
            # Cancel any pending follow-ups for this invoice
            await self._cancel_followups_for_invoice(invoice_id)
            
            print(f"💰 Payment processed for invoice {invoice_id}")
            
        return payment_result
    
    async def _cancel_followups_for_invoice(self, invoice_id: str):
        """Cancel pending follow-ups for paid invoice"""
        
        to_cancel = [fid for fid, followup in self.active_followups.items() 
                    if followup["invoice_id"] == invoice_id and followup["status"] == "scheduled"]
        
        for followup_id in to_cancel:
            self.active_followups[followup_id]["status"] = "cancelled"
            self.active_followups[followup_id]["cancelled_at"] = datetime.now().isoformat()
            print(f"❌ Cancelled follow-up: {followup_id}")
    
    async def get_collections_analytics(self) -> Dict[str, Any]:
        """Get collections analytics"""
        
        total_followups = len(self.active_followups)
        executed_followups = len([f for f in self.active_followups.values() 
                                if f.get("status") == "executed"])
        
        sent_to_collections = len([f for f in self.active_followups.values() 
                                 if f.get("sent_to_collections")])
        
        return {
            "total_followups": total_followups,
            "executed_followups": executed_followups,
            "success_rate": round((executed_followups / total_followups * 100) if total_followups > 0 else 0, 1),
            "sent_to_collections": sent_to_collections,
            "collection_rate": 8.5,  # Mock percentage
            "average_collection_time": "45 days",
            "follow_up_types": {
                "gentle": len([f for f in self.active_followups.values() 
                              if f.get("follow_up_type") == "gentle"]),
                "firm": len([f for f in self.active_followups.values() 
                            if f.get("follow_up_type") == "firm"]),
                "final_notice": len([f for f in self.active_followups.values() 
                                   if f.get("follow_up_type") == "final_notice"])
            }
        }

class PaymentProcessor:
    def __init__(self):
        self.stripe_key = os.getenv("STRIPE_SECRET_KEY")
        self.square_key = os.getenv("SQUARE_SECRET_KEY")
    
    async def process_payment(self, payment_data: Dict) -> Dict[str, Any]:
        """Process payment via payment processor"""
        
        # Mock payment processing
        return {
            "status": "success",
            "transaction_id": f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "amount": payment_data.get("amount"),
            "processed_at": datetime.now().isoformat()
        }