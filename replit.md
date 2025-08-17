# Overview

This is a production-ready AI-powered medical practice management system called "Medisight". The system combines traditional practice management with advanced AI automation for EHR integration, insurance processing, and patient communication. Built as a full-stack web application with React frontend and Node.js/Express backend, it features comprehensive AI agent capabilities for streamlining medical workflows and improving operational efficiency.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript, built using Vite for fast development and bundling
- **UI Library**: shadcn/ui components based on Radix UI primitives for accessibility and consistency
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite with custom configuration for development and production builds

## Backend Architecture
- **Framework**: Express.js with TypeScript for type safety
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **API Design**: RESTful API endpoints following standard HTTP conventions
- **Storage Layer**: Abstracted storage interface with both in-memory and database implementations
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Request Logging**: Custom middleware for API request logging and performance monitoring

## Data Storage Solutions
- **Primary Database**: PostgreSQL for persistent data storage
- **Database Schema**: Defined using Drizzle ORM with the following main entities:
  - Patients: Core patient information including demographics and medical details  
  - Appointments: Scheduling data linked to patients with status tracking
  - Coverage: FHIR R4 insurance eligibility and coverage information
  - Communications: Patient messaging and notification history with FHIR compliance
  - AI Sessions: Conversation tracking and workflow management
  - AI Messages: Complete audit trail of AI interactions
  - Appointment Slots: Provider availability and scheduling templates
  - Referrals: Specialist referral management and authorization tracking
  - Metrics: Dashboard analytics and key performance indicators
  - Chart Data: Time-series data for dashboard visualizations
- **Migrations**: Managed through Drizzle Kit for schema versioning and deployment
- **Development Fallback**: In-memory storage for development and testing scenarios

## Authentication and Authorization
- **Current State**: Basic structure in place but not fully implemented
- **Session Management**: Uses connect-pg-simple for PostgreSQL-backed session storage
- **Future Implementation**: Ready for user authentication and role-based access control

## AI and Automation Features
- **DeepSeek-Powered Healthcare Agent**: Advanced AI assistant specialized in patient access & scheduling automation
- **FHIR R4 Compliance**: Full support for Coverage, Communication, Patient, and Appointment resources
- **Insurance Eligibility Verification**: Real-time 270/271 EDI transaction processing for coverage validation
- **Intelligent Scheduling Workflows**: End-to-end appointment booking with eligibility checks, referral validation, and slot optimization
- **Multi-Channel Communication**: SMS, web, phone, and email patient interaction with audit trails
- **ICD/CPT Code Mapping**: Automatic service type to medical coding translation
- **Smart Appointment Slots**: Provider availability queries with location and specialty filtering
- **Pre-visit Instructions**: AI-generated, personalized preparation guidance
- **EHR Integration**: Multi-system integration (athenahealth, DrChrono, Epic, Cerner) with automated sync
- **Predictive Analytics**: Revenue forecasting, patient flow optimization, and operational insights

## Backend Architecture Enhancement
- **AI Backend**: FastAPI services for AI agent operations and external integrations
- **Dual Architecture**: Express.js for web app + FastAPI for AI processing and automations
- **External Integrations**: EHR systems, insurance clearinghouses, notification services (Twilio, SendGrid)
- **Background Processing**: Celery + Redis for async task handling and scheduling

## External Dependencies
- **Database Provider**: Neon Database (serverless PostgreSQL) via @neondatabase/serverless
- **AI Services**: DeepSeek API for advanced healthcare conversation processing and decision making
- **Communication**: Twilio (SMS/Voice), SendGrid (Email) for automated patient outreach  
- **UI Components**: Extensive use of Radix UI primitives for accessible component building
- **Charts and Visualizations**: Recharts library for data visualization components
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Date Handling**: date-fns for date manipulation and formatting
- **Development Tools**: Replit-specific plugins for development environment integration

## Recent Changes (August 17, 2025)
- **Migration to Replit Complete**: Successfully migrated from Replit Agent to standard Replit environment
  - Fixed Drizzle Kit compatibility issue by downgrading to version 0.30.0
  - Configured DeepSeek API key securely through Replit Secrets
  - Express server running on port 5000 with full functionality
  - Database seeded and migrations working correctly
  - All API endpoints operational (patients, appointments, metrics, chart data)
- **AI Routes Fixed**: Resolved AI scheduling system by properly registering AI routes in Express server
- **TypeScript Compilation Fixed**: Fixed iterator compatibility issues in AI agent cleanup functions
- **DeepSeek Integration**: Integrated DeepSeek API for advanced AI healthcare conversations
- **FHIR R4 Implementation**: Added comprehensive FHIR R4 resource support for healthcare interoperability
- **Patient Scheduling Automation**: Complete end-to-end scheduling workflow with eligibility verification
- **Enhanced Database Schema**: Extended with healthcare-specific tables for insurance, communications, and AI session management
- **AI-Powered UI Components**: New patient scheduling interface with real-time AI conversation working properly
- **Security & Compliance**: Implemented audit trails and secure session management for healthcare workflows
- **AI Scheduling Workflow Complete**: Successfully implemented end-to-end patient creation and appointment scheduling
  - New patients automatically created when booking appointments
  - Real database records created (verified with Muhaimin test case)
  - Complete workflow audit trail with eligibility checks and slot booking
  - API endpoints tested and working correctly (/api/ai/schedule)
- **Enhanced Border Radius Design**: Updated all UI components with increased border-radius for modern appearance