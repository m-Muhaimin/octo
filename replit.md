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
  - Metrics: Dashboard analytics and key performance indicators
  - Chart Data: Time-series data for dashboard visualizations
- **Migrations**: Managed through Drizzle Kit for schema versioning and deployment
- **Development Fallback**: In-memory storage for development and testing scenarios

## Authentication and Authorization
- **Current State**: Basic structure in place but not fully implemented
- **Session Management**: Uses connect-pg-simple for PostgreSQL-backed session storage
- **Future Implementation**: Ready for user authentication and role-based access control

## AI and Automation Features
- **AI Medical Agent**: Production-ready AI assistant using LangChain + OpenAI for medical insights
- **EHR Integration**: Multi-system integration (athenahealth, DrChrono, Epic, Cerner) with automated sync
- **Insurance Processing**: Automated claim submission, analysis, and approval likelihood prediction
- **Smart Notifications**: AI-driven appointment reminders and billing follow-ups
- **Predictive Analytics**: Revenue forecasting, patient flow optimization, and operational insights
- **Vector Database**: Medical knowledge base with policy and regulatory information

## Backend Architecture Enhancement
- **AI Backend**: FastAPI services for AI agent operations and external integrations
- **Dual Architecture**: Express.js for web app + FastAPI for AI processing and automations
- **External Integrations**: EHR systems, insurance clearinghouses, notification services (Twilio, SendGrid)
- **Background Processing**: Celery + Redis for async task handling and scheduling

## External Dependencies
- **Database Provider**: Neon Database (serverless PostgreSQL) via @neondatabase/serverless
- **AI Services**: OpenAI GPT-4o, LangChain for medical AI processing
- **Communication**: Twilio (SMS/Voice), SendGrid (Email) for automated patient outreach  
- **UI Components**: Extensive use of Radix UI primitives for accessible component building
- **Charts and Visualizations**: Recharts library for data visualization components
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Date Handling**: date-fns for date manipulation and formatting
- **Development Tools**: Replit-specific plugins for development environment integration